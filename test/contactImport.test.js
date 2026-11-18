import test from "node:test";
import assert from "node:assert/strict";
import { strToU8, zipSync } from "fflate";
import express from "express";
import ContactRouter from "../routes/contact/routes.js";
import ContactController from "../controllers/contact/controller.js";
import { normalizeImportedPhone, parseContactImport } from "../utils/contactImport.js";

test("parses a CSV single-column phone list and ignores a recognized header", async () => {
  const rows = await parseContactImport({
    originalname: "phones.csv",
    buffer: Buffer.from("\uFEFFtelefono\r\n+506 8888-0001\r\n88880002\r\n"),
  });
  assert.deepEqual(rows, [
    { row: 2, value: "+506 8888-0001" },
    { row: 3, value: "88880002" },
  ]);
});

test("parses JSON phone arrays and rejects multi-column CSV files", async () => {
  const rows = await parseContactImport({
    originalname: "phones.json",
    buffer: Buffer.from(JSON.stringify({ phoneNumbers: ["+14155550100", "4155550101"] })),
  });
  assert.deepEqual(rows.map(({ value }) => value), ["+14155550100", "4155550101"]);
  await assert.rejects(
    parseContactImport({ originalname: "phones.csv", buffer: Buffer.from("phone,name\n123,Ana") }),
    /una sola columna/,
  );
});

test("parses Excel .xlsx files with one phone column", async () => {
  const buffer = Buffer.from(zipSync({
    "[Content_Types].xml": strToU8(`<?xml version="1.0" encoding="UTF-8"?>
      <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
        <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
        <Default Extension="xml" ContentType="application/xml"/>
        <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
        <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
      </Types>`),
    "_rels/.rels": strToU8(`<?xml version="1.0" encoding="UTF-8"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
      </Relationships>`),
    "xl/workbook.xml": strToU8(`<?xml version="1.0" encoding="UTF-8"?>
      <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
        xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
        <sheets><sheet name="Contacts" sheetId="1" r:id="rId1"/></sheets>
      </workbook>`),
    "xl/_rels/workbook.xml.rels": strToU8(`<?xml version="1.0" encoding="UTF-8"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
      </Relationships>`),
    "xl/worksheets/sheet1.xml": strToU8(`<?xml version="1.0" encoding="UTF-8"?>
      <worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
        <sheetData>
          <row r="1"><c r="A1" t="inlineStr"><is><t>Phone</t></is></c></row>
          <row r="2"><c r="A2" t="inlineStr"><is><t>+14155550100</t></is></c></row>
          <row r="3"><c r="A3"><v>4155550101</v></c></row>
        </sheetData>
      </worksheet>`),
  }));
  const rows = await parseContactImport({ originalname: "phones.xlsx", buffer });
  assert.deepEqual(rows.map(({ value }) => value), ["+14155550100", 4155550101]);
});

test("normalizes local numbers with the selected code and full E.164 numbers", () => {
  assert.equal(normalizeImportedPhone("8888-0001", "+506").e164, "+50688880001");
  assert.equal(normalizeImportedPhone("+1 (415) 555-0100", "+506").e164, "+14155550100");
});

test("imports distinct valid numbers as unnamed contacts and reports duplicates and invalid rows", async () => {
  const savedContacts = [];
  const savedPhones = [];
  const controller = ContactController({
    id: "Contact",
    model: {
      getByCoincidence: async (filter) => {
        assert.deepEqual(filter, { owner: "owner-1" });
        return [{ _id: "existing-contact" }];
      },
      save: async (data) => {
        const contact = { _id: `contact-${savedContacts.length + 1}`, ...data };
        savedContacts.push(contact);
        return contact;
      },
      delete: async () => {},
    },
    phoneNumberModel: {
      getByCoincidence: async (filter) => {
        assert.deepEqual(filter, {
          ownerType: "Contact",
          owner: { $in: ["existing-contact"] },
        });
        return [{ owner: "existing-contact", e164: "+50688880003" }];
      },
      save: async (data) => {
        const phone = { _id: `phone-${savedPhones.length + 1}`, ...data };
        savedPhones.push(phone);
        return phone;
      },
      delete: async () => {},
    },
  });
  const response = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  await controller.importContacts({
    session: { userId: "owner-1" },
    body: { countryNumber: "+506" },
    file: {
      originalname: "phones.csv",
      buffer: Buffer.from("+50688880001\n+50688880001\ninvalid\n88880002\n88880003"),
    },
  }, response);

  assert.equal(response.statusCode, 201);
  assert.deepEqual(response.body, {
    createdCount: 2,
    duplicateCount: 2,
    invalidCount: 1,
    invalidRows: [3],
  });
  assert.ok(savedContacts.every((contact) => !("name" in contact)));
  assert.deepEqual(savedPhones.map(({ e164 }) => e164), ["+50688880001", "+50688880002"]);
});

test("accepts a multipart CSV import and persists each number as a contact", async () => {
  const savedContacts = [];
  const savedPhones = [];
  const app = express();
  app.use((req, _res, next) => {
    req.session = { userId: "owner-1" };
    next();
  });
  app.use("/contact", ContactRouter({
    id: "Contact",
    permissionModel: { getOne: async () => ({ _id: "contact-register" }) },
    userPermissionModel: { getOne: async () => ({ _id: "assignment" }) },
    actionLogModel: { save: async () => {} },
    actions: { post: "register" },
    model: {
      getByCoincidence: async () => [],
      save: async (data) => {
        const contact = { _id: `contact-${savedContacts.length + 1}`, ...data };
        savedContacts.push(contact);
        return contact;
      },
      delete: async () => {},
    },
    phoneNumberModel: {
      save: async (data) => {
        const phone = { _id: `phone-${savedPhones.length + 1}`, ...data };
        savedPhones.push(phone);
        return phone;
      },
      delete: async () => {},
    },
  }));
  const server = app.listen(0);
  try {
    const { port } = await new Promise((resolve) => server.once("listening", () => resolve(server.address())));
    const formData = new FormData();
    formData.append("countryNumber", "+506");
    formData.append("file", new Blob(["88880001\n"], { type: "text/csv" }), "phones.csv");
    const response = await fetch(`http://127.0.0.1:${port}/contact/import`, {
      method: "POST",
      body: formData,
    });

    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), {
      createdCount: 1,
      duplicateCount: 0,
      invalidCount: 0,
      invalidRows: [],
    });
    assert.equal(savedContacts[0].owner, "owner-1");
    assert.equal("name" in savedContacts[0], false);
    assert.equal(savedPhones[0].owner, savedContacts[0]._id);
    assert.equal(savedPhones[0].e164, "+50688880001");
  } finally {
    server.close();
  }
});
