const router = require("express").Router();
const {
  signUp,
  signIn,
  editProfile,
  sendForgetMail,
  forgetPassword,
  generateProfile,
} = require("../controllers/userController");
const validation = require("../assits/validation");
const upload = require("../assits/multer");
const passport = require("passport");

router.post("/signup", signUp);
router.post("/signin", signIn);
router.patch(
  "/edit",
  validation.validation,
  upload.single("file"),
  editProfile
);
router.post("/sendmail", sendForgetMail);
router.patch("/forgetpassword", forgetPassword);

/*  Google AUTH  */
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
let userProfile: any;
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.Backend_Link}/auth/google/callback`,
    },
    function (accessToken: any, refreshToken: any, profile: any, done: any) {
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
    let token: string = await generateProfile(userProfile);
    res.redirect(`${process.env.Frontend_Link}/google/${token}`);
  }
);
router.get("/error", (req: any, res: any) => {
  res.send("Something went wrong. try again");
});

module.exports = router;
export {};
