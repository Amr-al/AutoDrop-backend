import passport from "passport";
import { Strategy, VerifyCallback } from "passport-google-oauth2";
import { Request } from "express";
import { IProfileGoogle } from "../types/auth";
import { generateProfile } from "../controllers/userController";

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
      await generateProfile(profile);
      done(null, profile);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user: any, done) {
  done(null, user);
});
