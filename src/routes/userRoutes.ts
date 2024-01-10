const router = require("express").Router();
const { signUp, signIn, editProfile, sendForgetMail,forgetPassword } = require("../controllers/userController");
const validation = require('../assits/validation')
const upload = require('../assits/multer')
const sendEmail = require('../assits/sendMails')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require('../models/userModel')

router.post("/signup", signUp);
router.post("/signin", signIn);
router.patch('/edit', validation.validation , upload.single('file'), editProfile)
router.post('/sendmail', sendForgetMail)
router.patch('/forgetpassword',forgetPassword)


/*  Google AUTH  */
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
let userProfile:any;
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.Backend_Link}/auth/google/callback`,
    },
    function (accessToken:any, refreshToken:any, profile:any, done:any) {
      userProfile = profile;
      return done(null, userProfile);
    }
  )
);

router.get("/google",passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/error" }),
  async (req:any, res:any,next:any) => {
    req.user = userProfile;
    next();
    let email = userProfile.emails[0].value,
      name = userProfile.displayName;
    let user = await User.findOne({ email: email }),
      token = null;
    if (user) {
      let tmp = {
        name: user.name,
        image: user.image,
        id: user._id,
        email: user.email,
        phone: user.phone,
        country:user.cou
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
        image: userProfile.photos[0].value,
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
      sendEmail(
        "👋 ترحيب",
        `<h1>مرحبًا بك في موقعنا 👋</h1><h3>عزيزي ${name}</h3><h3>شكرًا لانضمامك إلى موقعنا. نحن سعداء لكونك عضوًا في مجتمعنا.</h3><h3>الرقم السري الخاصك بيك هو ${original}</h3><h3>يُرجى النظر حولك واستكشاف جميع الميزات التي نقدمها. إذا كان لديك أي أسئلة أو مشاكل، فلا تتردد في الاتصال بنا.</h3><h3>مرة أخرى، نرحب بك في موقعنا!</h3><h3>أطيب التحيات،</h3> <h3>فريق [Auto Drop]</h3>`,
        email
      );
    }
    res.redirect(`${process.env.Frontend_Link}/google/${token}`);
  }
);
router.get('/error',(req:any,res:any)=>{
    res.send('Something went wrong. try again')
})

module.exports = router;
export{}