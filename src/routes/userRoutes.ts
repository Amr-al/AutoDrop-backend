import { Router } from "express";
import passport from "passport";
import {
  signUp,
  signIn,
  editProfile,
  forgetPassword,
  sendForgetMail,
  generateProfile,
} from "../controllers/userController";
import upload from "../assits/multer";

const router = Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.patch("/edit", upload.single("file"), editProfile);
router.post("/sendmail", sendForgetMail);
router.patch("/forgetpassword", forgetPassword);

/*  Google AUTH  */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/api/v1/auth/error" }),
  async (req: any, res: any, next: any) => {
    res.redirect(`${process.env.Frontend_Link}`);
  }
);
router.get("/error", (req: any, res: any) => {
  res.send("Something went wrong. try again");
});

export default router;
