import express from "express";
import("./utils/passport");
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import cors from "cors";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import xss from "xss";
import compression from "compression";
import { conect } from "./utils/DBConnection";
import userRoutes from "./routes/userRoutes";
import globalErrorHandler from "./controllers/errorController";
import AppError from "./utils/appError";

const app = express();

//Parse json bodies
app.use(express.json());

//Parse cookies
app.use(cookieParser());

//Allow cors for all domains
app.use(
  cors({
    origin: "*",
    credentials: true,
  }) as any
);

//Session middleware
app.use(
  session({
    secret: process.env.secret!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  })
);

//Initialize passport
app.use(passport.initialize());

//Use passport session
app.use(passport.session());

//Use morgan logger in the develpment
app.use(morgan("dev"));

//Set security http headers
app.use(helmet());

//Data sanitization against xss attacks
xss('<script>alert("xss");</script>');

//Compress all text sent in the response to the client
if (process.env.NODE_ENV === "production") {
  app.use(compression());
}

conect();

//Global resources
app.use("/api/v1/auth", userRoutes);

// Handle requests from wrong urls
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//Using global error handling middleware
app.use(globalErrorHandler);

app.listen(10000, () => {
  console.log(`server is running `);
});
