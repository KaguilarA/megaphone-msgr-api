import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import { encrypt, decrypt, isEncrypted } from "../utils/crypto.js";

const isBcryptHash = (val) => {
  if (typeof val !== "string") return false;
  return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(val);
};

export default (id, schema, encryptedFields = [], hashedFields = []) =>
  new (class {
    constructor(id, schema, encryptedFields, hashedFields) {
      this.schema = new Schema(schema, { timestamps: true });
      this.id = id;
      this.encryptedFields = encryptedFields;
      this.hashedFields = hashedFields;

      if (this.encryptedFields.length > 0 || this.hashedFields.length > 0) {
        this.setupSecurityHooks();
      }

      this.model = model(this.id, this.schema);
    }

    setupSecurityHooks() {
      const encFields = this.encryptedFields;
      const hashFields = this.hashedFields;

      this.schema.pre("save", async function (next) {
        encFields.forEach((field) => {
          if (
            this.isModified(field) &&
            this[field] &&
            !isEncrypted(this[field])
          ) {
            this[field] = encrypt(this[field]);
          }
        });

        for (const field of hashFields) {
          if (
            this.isModified(field) &&
            this[field] &&
            !isBcryptHash(this[field])
          ) {
            const salt = await bcrypt.genSalt(10);
            this[field] = await bcrypt.hash(this[field], salt);
          }
        }

        next();
      });

      this.schema.pre(
        ["findOneAndUpdate", "updateOne", "updateMany"],
        async function (next) {
          const update = this.getUpdate();
          if (!update) return next();

          encFields.forEach((field) => {
            const val = update[field] || (update.$set && update.$set[field]);
            if (val && typeof val === "string" && !isEncrypted(val)) {
              const encryptedVal = encrypt(val);
              if (update[field]) update[field] = encryptedVal;
              if (update.$set && update.$set[field])
                update.$set[field] = encryptedVal;
            }
          });

          for (const field of hashFields) {
            const val = update[field] || (update.$set && update.$set[field]);

            if (val && typeof val === "string" && !isBcryptHash(val)) {
              const salt = await bcrypt.genSalt(10);
              const hashedVal = await bcrypt.hash(val, salt);
              if (update[field]) update[field] = hashedVal;
              if (update.$set && update.$set[field])
                update.$set[field] = hashedVal;
            }
          }

          next();
        },
      );

      const processDocumentAfterQuery = (doc) => {
        if (!doc) return;

        encFields.forEach((field) => {
          if (doc[field] && isEncrypted(doc[field])) {
            try {
              doc[field] = decrypt(doc[field]);
            } catch (error) {
              console.error(
                `Error al descifrar el campo ${field}:`,
                error.message,
              );
            }
          }
        });
      };

      this.schema.post(
        ["find", "findOne", "findOneAndUpdate"],
        function (result) {
          if (!result) return;
          if (Array.isArray(result)) {
            result.forEach(processDocumentAfterQuery);
          } else {
            processDocumentAfterQuery(result);
          }
        },
      );

      this.schema.set("toJSON", {
        transform: (doc, ret) => {
          encFields.forEach((field) => delete ret[field]);
          hashFields.forEach((field) => delete ret[field]);
          return ret;
        },
      });
    }

    _applyPopulate(query, populateOption) {
      if (!populateOption) return query;

      const parsePopulateString = (str) => {
        const parts = str.split(".");
        if (parts.length === 1) return str;

        let nestedObj = null;
        for (let i = parts.length - 1; i >= 0; i--) {
          if (i === parts.length - 1) {
            nestedObj = { path: parts[i] };
          } else {
            nestedObj = { path: parts[i], populate: nestedObj };
          }
        }
        return nestedObj;
      };

      if (Array.isArray(populateOption)) {
        populateOption.forEach((item) => {
          if (typeof item === "string" && item.includes(".")) {
            query = query.populate(parsePopulateString(item));
          } else {
            query = query.populate(item);
          }
        });
      } else if (
        typeof populateOption === "string" &&
        populateOption.includes(".")
      ) {
        query = query.populate(parsePopulateString(populateOption));
      } else {
        query = query.populate(populateOption);
      }

      return query;
    }

    async compareHash(id, field, candidateValue) {
      if (!this.hashedFields.includes(field)) {
        throw new Error(
          `El campo '${field}' no está registrado en los hashedFields de este modelo.`,
        );
      }

      const doc = await this.model.findById(id).select(`+${field}`).lean();
      if (!doc || !doc[field]) return false;

      return await bcrypt.compare(candidateValue, doc[field]);
    }

    async delete(id) {
      return await this.model.findByIdAndDelete(id);
    }

    async getAll(options = {}) {
      let query = this.model.find();
      if (options.populate) {
        query = this._applyPopulate(query, options.populate);
      }
      return await query;
    }

    async getById(id, options = {}) {
      let query = this.model.findById(id);
      if (options.populate) {
        query = this._applyPopulate(query, options.populate);
      }
      return await query;
    }

    async getOne(filter = {}, options = {}) {
      let query = this.model.findOne(filter);
      if (options.populate) {
        query = this._applyPopulate(query, options.populate);
      }
      return await query;
    }

    async save(data) {
      const newData = new this.model(data);
      return await newData.save();
    }

    async update(id, data, options = {}) {
      let query = this.model.findByIdAndUpdate(id, data, {
        new: true,
        ...options,
      });
      if (options.populate) {
        query = this._applyPopulate(query, options.populate);
      }
      return await query;
    }
  })(id, schema, encryptedFields, hashedFields);
