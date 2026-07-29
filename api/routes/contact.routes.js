import { Router } from "express";
import DBController from "../utils/controller.js";
import { ensureAuthenticated } from "../../config/auth.js";
import userModel from "../../db/models/user.js";

export default (data) => {
  const router = Router();
  const controller = DBController(data);

  router.use(ensureAuthenticated);

  router.post("/", async (req, res) => {
    try {
      console.log(req.session);
      const createdContact = await data.model.save(req.body);

      if (req.user) {
        await userModel.model.findByIdAndUpdate(req.user._id, {
          $addToSet: { contacts: createdContact._id },
        });
      }

      return res.status(201).json(createdContact);
    } catch (error) {
      console.error("Error creando contacto:", error);
      return res.status(500).json({
        message: "Contact register error.",
        error: error.message || error,
      });
    }
  });

  router.get("/", controller.getAll.bind(controller));
  router.get("/:id", controller.getById.bind(controller));
  router.put("/:id", controller.update.bind(controller));
  router.delete("/:id", controller.delete.bind(controller));

  return router;
};
