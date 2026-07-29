import contact from "./../db/models/contact.model.js";
import email from "./../db/models/email.model.js";
import user from "./../db/models/user.model.js";

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