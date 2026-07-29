import { Router } from "express";
import AddressRouter from "./routes/address.routes.js";
import AuthRouter from "./routes/auth.routes.js";
import ContactRouter from "./routes/contact.routes.js";
import EmailRouter from "./routes/email.routes.js";
import PhoneNumberRouter from "./routes/phoneNumber.routes.js";
import UserRouter from "./routes/user.routes.js";
import UserTokensRouter from "./routes/userTokens.routes.js";

import ApiConfig from "./index.js";

export default () => {
  const controllers = [
    AddressRouter,
    AuthRouter,
    ContactRouter,
    EmailRouter,
    PhoneNumberRouter,
    UserRouter,
    UserTokensRouter,
  ];
  const router = Router();

  ApiConfig.forEach(({ url, config }, i) => {
    router.use(url, controllers[i](config));
  });

  return router;
};