"use strict";
/*  PASSPORT SETUP  */
Object.defineProperty(exports, "__esModule", { value: true });
const passport = require("passport");
passport.serializeUser(function (user, cb) {
    cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});
