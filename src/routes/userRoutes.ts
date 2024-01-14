import { Router } from "express";
import "../utils/passport";
import passport from "passport";
import {
  signUp,
  signIn,
  editProfile,
  forgetPassword,
  sendForgetMail,
  generateProfile,
} from "../controllers/authController";
import upload from "../assits/multer";
import { Strategy, VerifyCallback } from "passport-google-oauth2";
import { Request } from "express";
import { IProfileGoogle } from "../types/auth";

const router = Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.patch("/edit", upload.single("file"), editProfile);
router.post("/sendmail", sendForgetMail);
router.patch("/forgetpassword", forgetPassword);

/*  Google AUTH  */
let userProfile: IProfileGoogle;
passport.use(
  new Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.Backend_Link}/api/v1/auth/google/callback`,
      passReqToCallback: true,
    },
    async function (
      req: Request,
      accessToken: string,
      refreshToken: string,
      profile: IProfileGoogle,
      done: VerifyCallback
    ) {
      userProfile = profile;
      done(null, profile);
    }
  )
);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/error" }),
  async (req: Request, res: any) => {
    let token: string = await generateProfile(userProfile);
    res.redirect(`${process.env.Frontend_Link}/${token}`);
  }
);
router.get("/error", (req: any, res: any) => {
  res.send("Something went wrong. try again");
});

export default router;
