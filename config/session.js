import session from "express-session";

export default function () {
  return session({
    secret: process.env.SESSION_SECRET || "1234567890",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  });
}
