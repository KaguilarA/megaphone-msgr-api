import contact from "../db/models/contact.js";
import email from "../db/models/email.js";
import user from "../db/models/user.js";

export default [
  {
    url: "/contact",
    config: {
      model: contact,
    },
  },
  {
    url: "/user",
    config: {
      model: user,
    },
  },
  {
    url: "/auth",
    config: {
      model: undefined,
    },
  },
];