import userModel from "../db/models/user.js";

const USER_POPULATE_FIELDS = [
  "addresses",
  "contacts",
  "contacts.phoneNumbers",
  "contacts.emails",
  "contacts.addresses",
  "email",
  "phoneNumber",
  "userTokens",
];

export const attachActiveUser = async (req, res, next) => {
  console.log(req.session);
  if (!req.session?.userId) {
    return next();
  }

  try {
    const user = await userModel.getById(req.session.userId, {
      populate: USER_POPULATE_FIELDS,
    });

    if (!user) {
      req.session.destroy(() => {});
      return next();
    }

    req.user = user;
    res.locals.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

export const ensureAuthenticated = (req, res, next) => {
  console.log(req.session);
  

  if (req.user) {
    return next();
  }

  return res.status(401).json({
    authenticated: false,
    error: "No autorizado",
  });
};

export const ensureAppAuthenticated = (req, res, next) => {
  if (req.user) {
    return next();
  }

  return res.redirect("/auth");
};

// Middleware: ensure user exists and reload with populated relations
export const ensureUserWithContacts = async (req, res, next) => {
  if (!req.user) {
    return res.redirect("/auth");
  }

  try {
    const user = await userModel.getById(req.user._id, {
      populate: USER_POPULATE_FIELDS,
    });

    if (!user) {
      req.session?.destroy(() => {});
      return res.redirect("/auth");
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};
