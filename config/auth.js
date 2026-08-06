import userModel from "../db/models/user.js";

export const attachActiveUser = async (req, res, next) => {
  console.log(req.session);
  if (!req.session?.userId) {
    return next();
  }

  try {
    const user = await userModel.getById(req.session.userId, {
      populate: [
        "addresses",
        "contacts",
        "contacts.phoneNumbers",
        "contacts.emails",
        "contacts.addresses",
        "email",
        "phoneNumber",
        "tokens",
      ],
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
