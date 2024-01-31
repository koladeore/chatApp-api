import crypto from "crypto";
import jwt from "jsonwebtoken";
import { UserLoginType, UserRolesEnum } from "../constant.js";
import { User } from "../models/auth/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from "../utils/mail.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
      const user = await User.findById(userId);
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
      // attach refresh token to the user document to avoid refreshing the access token with multiple refresh tokens
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });
      return { accessToken, refreshToken };
    } catch (error) {
      throw new ApiError(
        500,
        "Something went wrong while generating the access token"
      );
    }
  };
const registerUser = asyncHandler(async(req,res) => {
    const { email, username, password, role } = req.body;
    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });
    if(existedUser){
        throw new ApiError(409, "User with email or username already exists", []);
    }
    const user = await User.create({
        email,
        password,
        username,
        isEmailVerified: false,
        role: role || UserRolesEnum.USER,
    })
    /**
        * unHashedToken: unHashed token is something we will send to the user's mail
        * hashedToken: we will keep record of hashedToken to validate the unHashedToken in verify email controller
        * tokenExpiry: Expiry to be checked before validating the incoming token
   */
    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
    /**
        * assign hashedToken and tokenExpiry in DB till user clicks on email verification link
        * The email verification is handled by {@link verifyEmail}
   */
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({ validateBefore: false });
    await sendEmail({
        email: user?.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationMailgenContent(
          user.username,
          `${req.protocol}://${req.get(
            "host"
          )}/api/v1/users/verify-email/${unHashedToken}`
        ),
    });
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    )
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user");
    }
    return res.status(201).json(new ApiResponse(201, { user: createdUser }, "Users registered successfully and verification email has been sent on your email." ))
});
const loginUser = asyncHandler(async (req,res) => {
  const { email, username, password } = req.body;
  if(!username && !email){
    throw new ApiError(400, "Username or email is required");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if(!user){
    throw new ApiError(404, "User does not exist");
  }
  if(user.loginType !== UserLoginType.EMAIL_PASSWORD){
    // If user is registered with some other method, we will ask him/her to use the same method as registered.
    // This shows that if user is registered with methods other than email password, he/she will not be able to login with password.
    // Which makes password field redundant for the SSO
    throw new ApiError(
      400,
      "You have previously registered using" + user.loginType?.toLowerCase() + 
      ". Please use the " + user.loginType?.toLowerCase() + "login option to access your account."
    )
  }
  // compare the incoming password with hashed password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if(!isPasswordValid){
    throw new ApiError(401, "Invalid user credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  // get the user document ignoring the password and refreshToken field
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options) // set the access token in the cookie
    .cookie("refreshToken", refreshToken, options) // set the refresh token in the cookie
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken }, // send access and refresh token in response if client decides to save them by themselves
        "User logged in successfully"
      )
    )
});

export { registerUser, loginUser }