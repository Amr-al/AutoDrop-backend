import passport from "passport";
import { Strategy, VerifyCallback } from "passport-google-oauth2";
import { Request } from "express";
import { IProfileGoogle } from "../types/auth";
import { generateProfile } from "../controllers/authController";


passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user: any, done) {
  done(null, user);
});
