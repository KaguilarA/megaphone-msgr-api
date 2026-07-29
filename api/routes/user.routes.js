import { Router } from "express";
import DBController from "../utils/controller.js";
import { ensureAuthenticated } from "../../config/auth.js";
import userTokensModel from "../../db/models/userTokens.js";

export default (data) => {
  const router = Router();
  const controller = DBController(data);

  router.post("/", controller.register.bind(controller));
  router.use(ensureAuthenticated);
  router.get("/", controller.getAll.bind(controller));
  router.get("/:id", controller.getById.bind(controller));

  router.put("/:id", async (req, res) => {
    try {
      const body = { ...req.body };
      const tokenData = body.userTokens;

      if (tokenData && typeof tokenData === "object") {
        const tokenId = tokenData._id || tokenData.id;
        let tokenDoc = null;

        if (tokenId) {
          tokenDoc = await userTokensModel.update(tokenId, tokenData);
        }

        if (!tokenDoc) {
          const existingUser = await data.model.getById(req.params.id);
          const existingTokenId =
            existingUser?.userTokens?._id || existingUser?.userTokens;

          if (existingTokenId) {
            tokenDoc = await userTokensModel.update(existingTokenId, tokenData);
          }
        }

        if (!tokenDoc) {
          tokenDoc = await userTokensModel.save(tokenData);
        }

        if (tokenDoc) {
          body.userTokens = tokenDoc._id;
        } else {
          delete body.userTokens;
        }
      }

      req.body = body;
      return controller.update(req, res);
    } catch (error) {
      console.error("Error updating user tokens:", error);
      return res.status(500).json({
        message: `${data.id} error update.`,
        error: error.message || error,
      });
    }
  });

  router.delete("/:id", controller.delete.bind(controller));

  return router;
};
