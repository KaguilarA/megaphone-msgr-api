import { Router } from "express";
import loadContries from "./contries.controller.js";

const CountriesRouter = Router();

CountriesRouter.get("/", loadContries);

export default CountriesRouter;
