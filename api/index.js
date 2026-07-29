import address from "../db/models/address.js";
import contact from "../db/models/contact.js";
import email from "../db/models/email.js";
import phoneNumber from "../db/models/phoneNumber.js";
import user from "../db/models/user.js";
import userTokens from "../db/models/userTokens.js";

export default [
  {
    url: "/address",
    config: {
      id: "Address",
      model: address,
    },
  },
  {
    url: "/auth",
    config: {
      id: "Auth",
      models: [
        {
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
        {
          id: "Email",
          model: email,
        },
      ],
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
