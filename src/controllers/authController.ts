import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import sendMail from "../assits/sendMails";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
import User from "../models/userModel";
import {
  hashPassword,
  comparePassword,
  responseAndToken,
} from "../utils/authHelperFunction";

const secret = speakeasy.generateSecret({ length: 20 });

let validateEmail = function (email: string) {
  let re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

export const signUp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, role } = req.body;
    if (!name) {
      return next(new AppError("please enter your name", 400));
    }
    if (!email) {
      return next(new AppError("please enter your email", 400));
    }
    if (!validateEmail(email)) {
      return next(new AppError("please enter a valid email", 400));
    }
    if (!password) {
      return next(new AppError("please enter your password", 400));
    }
    let check = await User.findOne({ email: email });
    if (check) {
      return next(new AppError("email already exists", 400));
    }

    let hashed = await hashPassword(password);
    let user = await User.create({
      name,
      email,
      password: hashed,
      role,
    });
    responseAndToken(user, res, 201);
  }
);

export const signIn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email) {
      return next(new AppError("please enter your email", 400));
    }
    if (!password) {
      return next(new AppError("please enter your password", 400));
    }
    const user = await User.findOne({ email });

    if (!user || !(await comparePassword(password, user.password))) {
      return next(new AppError("Invalid email or password", 401));
    }

    responseAndToken(user, res, 200);
  }
);

export const editProfile = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    if (
      req.body.password &&
      (!req.body.confirmPassword || !req.body.currentPassword)
    ) {
      return next(new AppError("please enter your current password", 400));
    }
    let password = null;
    let user = await User.findById(req.user.id);
    if (req.body.password) {
      password = await bcrypt.hash(req.body.password, 10);
    }
    let same: boolean = await bcrypt.compare(
      req.body.currentPassword,
      user!.password
    );
    if (!same) {
      return next(new AppError("wrong password", 400));
    }
    let update: Object = {
      name: req.body.name || req.user.name,
      email: req.body.email || req.user.email,
      image: req.file ? req.file.path : req.user.image,
      phone: req.body.phone || req.user.phone,
      country: req.body.country || req.user.country,
      merchantID: req.body.merchantID || req.user.merchantID,
      storeName: req.body.storeName || req.user.storeName,
      storeLink: req.body.storeLink || req.user.storeLink,
      id: req.user.id,
    };
    await User.findByIdAndUpdate(req.user.id, update);
    const token: string = jwt.sign(update, "HS256", {
      expiresIn: "24h",
    });
    return res.status(200).json(token);
  }
);

export const forgetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let { id, OTP, password, confirmPassword } = req.body;
    if (!id) return next(new AppError("wrong data", 400));
    if (!OTP) return next(new AppError("Wrong data", 400));
    if (!password) return next(new AppError("please enter your password", 400));
    if (confirmPassword != password)
      return next(new AppError("passwords don't match", 400));
    let user = await User.findOne({ _id: id, OTP: OTP });
    if (!user) {
      return next(new AppError("wrong data", 400));
    } else {
      let hashed: string = await bcrypt.hash(password, 10);
      const code = speakeasy.totp({
        secret: secret.base32,
        encoding: "base32",
      });

      await User.findOneAndUpdate(
        { _id: id, OTP: OTP },
        { OTP: code, password: hashed }
      );

      return res.status(200).json("password changed successfully");
    }
  }
);

export const sendForgetMail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, locale } = req.body;
    let check = validateEmail(email);
    if (!check) return next(new AppError("please enter a valid email", 400));
    const user = await User.findOne({ email: email });
    if (!user) {
      return next(new AppError("email doesn't exist", 400));
    }
    const code = speakeasy.totp({
      secret: secret.base32,
      encoding: "base32",
    });
    user.OTP = code;
    let base: string | undefined = process.env.Frontend_Link;
    const url = `${base}/${locale}/resetPassword/${user._id}/${user.OTP}`;
    sendMail(
      "اعاده تعيين كلمه السر",
      `<h4>اضغط علي الرابط التالي لاعاده تعيين كلمه المرر</h4><a href=${url}>${url}<a/> <h4>فريق [Auto Drop]</h4>`,
      email
    );
    user.save();
    return res.status(200).json("message sent");
  }
);

export const generateProfile = async (userProfile: any): Promise<string> => {
  let email = userProfile._json.email,
    name = userProfile._json.name;
  console.log(email);

  let user = await User.findOne({ email: email }),
    token = null;
  if (user) {
    let tmp = {
      name: user.name,
      image: user.image,
      id: user._id,
      email: user.email,
      phone: user.phone,
      country: user.country,
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
        image: userProfile._json.picture,
      },
      "HS256"
    );
    sendMail(
      "👋 ترحيب",
      `<h1>مرحبًا بك في موقعنا 👋</h1><h3>عزيزي ${name}</h3><h3>شكرًا لانضمامك إلى موقعنا. نحن سعداء لكونك عضوًا في مجتمعنا.</h3><h3>الرقم السري الخاص بيك هو ${original}</h3><h3>يُرجى النظر حولك واستكشاف جميع الميزات التي نقدمها. إذا كان لديك أي أسئلة أو مشاكل، فلا تتردد في الاتصال بنا.</h3><h3>مرة أخرى، نرحب بك في موقعنا!</h3><h3>أطيب التحيات،</h3> <h3>فريق [Auto Drop]</h3>`,
      email
    );
  }

  return token;
};
