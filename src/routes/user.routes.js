import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controllers.js";
import { userRegisterValidator, userLoginValidator } from "../validators/user.validators.js";
import { validate } from "../validators/validate.js";

const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);

export default router;