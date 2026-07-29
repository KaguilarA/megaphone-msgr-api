import address from "./../db/models/address.model.js";
import contact from "./../db/models/contact.model.js";
import email from "./../db/models/email.model.js";
import phoneNumber from "./../db/models/phoneNumber.model.js";
import user from "./../db/models/user.model.js";
import userTokens from "./../db/models/userTokens.model.js";

export default [
  {
    url: "/address",
    config: {
      id: "Address",
      model: address,
    },
  },
  {
    url: "/contact",
    config: {
      id: "Contact",
      model: contact,
      populatedFields: ["addresses", "emails", "phoneNumbers"],
    },
  },
  {
    url: "/email",
    config: {
      id: "Email",
      model: email,
    },
  },
  {
    url: "/phone-number",
    config: {
      id: "Phone Number",
      model: phoneNumber,
    },
  },
  {
    url: "/user",
    config: {
      id: "User",
      model: user,
      populatedFields: [
        "addresses",
        "contacts",
        "contacts.phoneNumbers",
        "contacts.emails",
        "contacts.addresses",
        "email",
        "phoneNumber",
        "userTokens",
      ],
    },
  },
  {
    url: "/tokens",
    config: {
      id: "UserToken",
      model: userTokens,
    },
  },
];
