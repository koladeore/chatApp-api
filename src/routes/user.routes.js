import { Router } from "express";
import {
    assignRole,
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgottenPassword,
  updateUserAvatar,
  verifyEmail,
} from "../controllers/user.controllers.js";
import {
  userRegisterValidator,
  userLoginValidator,
  userForgotPasswordValidator,
  userResetForgottenPasswordValidator,
  userChangeCurrentPasswordValidator,
  userAssignRoleValidator,
  mongoIdPathVariableValidator,
} from "../validators/user.validators.js";
import { validate } from "../validators/validate.js";
import { verifyJWT, verifyPermission } from "../middlewares/auth.middlewares.js";
import { UserRolesEnum } from "../constant.js";
import { upload } from "../middlewares/multer.middlewares.js";

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
router
  .route("/change-password")
  .post(
    verifyJWT,
    userChangeCurrentPasswordValidator(),
    validate,
    changeCurrentPassword
  );
router
  .route("/assign-role/:userId")
  .post(
    verifyJWT,
    verifyPermission([UserRolesEnum.USER]), // Only those with user role can change to admin, if it is UserRolesEnum.ADMIN] ONLY ADMIN CAN CHANGE TO USER
    mongoIdPathVariableValidator("userId"),
    userAssignRoleValidator(),
    validate,
    assignRole
  );
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/avatar").patch(verifyJWT,upload.single("avatar"), updateUserAvatar)

export default router;
