import { Router } from "express";
import { Strategy, VerifyCallback } from "passport-google-oauth2";
import passport from "passport";
import {
  signUp,
  signIn,
  editProfile,
  forgetPassword,
  sendForgetMail,
} from "../controllers/authController";
import upload from "../assits/multer";
import { generateProfile } from "../controllers/authController";
import sendMail from "../assits/sendMails";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel";

const router = Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.patch("/edit", upload.single("file"), editProfile);
router.post("/sendmail", sendForgetMail);
router.patch("/forgetpassword", forgetPassword);

/*  Google AUTH  */
let userProfile: any;
passport.use(
  new Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.Backend_Link}/api/v1/auth/google/callback`,
      passReqToCallback: true,
    },
    function (accessToken: any, refreshToken: any, profile: any, done: any) {
      console.log(profile);
      userProfile = profile;

      return done(null, userProfile);
    }
  )
);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/error" }),
  async (req: any, res: any, next: any) => {
    // console.log(userProfile);

    req.user = userProfile;
    next();
    let email = userProfile._json.email,
      name = userProfile._json.name;
    let user = await User.findOne({ email: email }),
      token = null;
    if (user) {
      let tmp = {
        name: user.name,
        image: user.image,
        id: user._id,
        email: user.email,
      };
      token = jwt.sign(tmp, "HS256");
    } else {
      let randm = Math.floor(Math.random() * 10000) + 1;
      let pass = "quflpdj" + randm,
        original;
      original = pass;
      pass = await bcrypt.hash(pass, 10);
      user = await User.create({
        email: email,
        name: name,
        password: pass,
        image: userProfile._json.picture,
      });
      token = jwt.sign(
        {
          _id: user._id,
          email: email,
          name: name,
          password: pass,
          image: userProfile.photos[0].value,
        },
        "HS256"
      );
      sendMail(
        "👋 ترحيب",
        `<h1>مرحبًا بك في موقعنا 👋</h1><h3>عزيزي ${name}</h3><h3>شكرًا لانضمامك إلى موقعنا. نحن سعداء لكونك عضوًا في مجتمعنا.</h3><h3>الرقم السري الخاصك بيك هو ${original}</h3><h3>يُرجى النظر حولك واستكشاف جميع الميزات التي نقدمها. إذا كان لديك أي أسئلة أو مشاكل، فلا تتردد في الاتصال بنا.</h3><h3>مرة أخرى، نرحب بك في موقعنا!</h3><h3>أطيب التحيات،</h3> <h3>فريق [Auto Drop]</h3>`,
        email
      );
    }
    res.redirect(`${process.env.Frontend_Link}/${token}`);
  }
);
router.get("/error", (req: any, res: any) => {
  res.send("Something went wrong. try again");
});

export default router;
