/*  PASSPORT SETUP  */

const passport = require("passport");

passport.serializeUser(function (user:any, cb:any) {
  cb(null, user);
});

passport.deserializeUser(function (obj:any, cb:any) {
  cb(null, obj);
});
export {};
