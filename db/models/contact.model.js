import { Schema } from "mongoose";
import DBModel from "./../utils/model.js";

const ContactModel = DBModel("Contact", {
  name: {
    type: String,
    required: [true, "El nombre del contacto es obligatorio."],
    trim: true,
  },
  phoneNumbers: [
    {
      type: Schema.Types.ObjectId,
      ref: "PhoneNumber",
      required: true,
    },
  ],
  emails: [
    {
      type: Schema.Types.ObjectId,
      ref: "Email",
    },
  ],
  addresses: [
    {
      type: Schema.Types.ObjectId,
      ref: "Address",
    },
  ],
});

const originalDelete = ContactModel.delete.bind(ContactModel);

ContactModel.delete = async function (id) {
  const contact = await this.model.findById(id).lean();
  if (!contact) return null;

  const deleted = await originalDelete(id);
  if (!deleted) return null;

  const UserModel = this.model.db.model("User");
  await UserModel.updateMany({ contacts: id }, { $pull: { contacts: id } });

  if (contact.phoneNumbers?.length) {
    await this.model.db.model("PhoneNumber").deleteMany({
      _id: { $in: contact.phoneNumbers },
    });
  }

  if (contact.emails?.length) {
    await this.model.db.model("Email").deleteMany({
      _id: { $in: contact.emails },
    });
  }

  if (contact.addresses?.length) {
    await this.model.db.model("Address").deleteMany({
      _id: { $in: contact.addresses },
    });
  }

  return deleted;
};

export default ContactModel;
