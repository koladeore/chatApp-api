import { Router } from "express";
import {
    changeCurrentPassword,
  forgotPasswordRequest,
  loginUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgottenPassword,
  verifyEmail,
} from "../controllers/user.controllers.js";
import {
  userRegisterValidator,
  userLoginValidator,
  userForgotPasswordValidator,
  userResetForgottenPasswordValidator,
  userChangeCurrentPasswordValidator,
} from "../validators/user.validators.js";
import { validate } from "../validators/validate.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router
  .route("/resend-email-verification")
  .post(verifyJWT, resendEmailVerification);
router.route("/refresh-token").post(refreshAccessToken);
router
  .route("/forgot-password")
  .post(userForgotPasswordValidator(), validate, forgotPasswordRequest);
router
  .route("/reset-password/:resetToken")
  .post(
    userResetForgottenPasswordValidator(),
    validate,
    resetForgottenPassword
);
router.route("/change-password").post(verifyJWT, userChangeCurrentPasswordValidator(), validate, changeCurrentPassword)

export default router;
