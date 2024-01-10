"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const router = require("express").Router();
const { signUp, signIn, editProfile, sendForgetMail, forgetPassword, generateProfile, } = require("../controllers/userController");
const validation = require("../assits/validation");
const upload = require("../assits/multer");
const passport = require("passport");
router.post("/signup", signUp);
router.post("/signin", signIn);
router.patch("/edit", validation.validation, upload.single("file"), editProfile);
router.post("/sendmail", sendForgetMail);
router.patch("/forgetpassword", forgetPassword);
/*  Google AUTH  */
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
let userProfile;
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.Backend_Link}/auth/google/callback`,
}, function (accessToken, refreshToken, profile, done) {
    userProfile = profile;
    return done(null, userProfile);
}));
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/auth/error" }), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token = yield generateProfile(userProfile);
    res.redirect(`${process.env.Frontend_Link}/google/${token}`);
}));
router.get("/error", (req, res) => {
    res.send("Something went wrong. try again");
});
module.exports = router;
