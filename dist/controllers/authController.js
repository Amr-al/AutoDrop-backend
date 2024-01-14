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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProfile = exports.sendForgetMail = exports.forgetPassword = exports.editProfile = exports.signIn = exports.signUp = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const speakeasy_1 = __importDefault(require("speakeasy"));
const sendMails_1 = __importDefault(require("../assits/sendMails"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const appError_1 = __importDefault(require("../utils/appError"));
const userModel_1 = __importDefault(require("../models/userModel"));
const authHelperFunction_1 = require("../utils/authHelperFunction");
const secret = speakeasy_1.default.generateSecret({ length: 20 });
let validateEmail = function (email) {
    let re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};
exports.signUp = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, role } = req.body;
    if (!name) {
        return next(new appError_1.default("please enter your name", 400));
    }
    if (!email) {
        return next(new appError_1.default("please enter your email", 400));
    }
    if (!validateEmail(email)) {
        return next(new appError_1.default("please enter a valid email", 400));
    }
    if (!password) {
        return next(new appError_1.default("please enter your password", 400));
    }
    let check = yield userModel_1.default.findOne({ email: email });
    if (check) {
        return next(new appError_1.default("email already exists", 400));
    }
    let hashed = yield (0, authHelperFunction_1.hashPassword)(password);
    let user = yield userModel_1.default.create({
        name,
        email,
        password: hashed,
        role,
    });
    (0, authHelperFunction_1.responseAndToken)(user, res, 201);
}));
exports.signIn = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email) {
        return next(new appError_1.default("please enter your email", 400));
    }
    if (!password) {
        return next(new appError_1.default("please enter your password", 400));
    }
    const user = yield userModel_1.default.findOne({ email });
    if (!user || !(yield (0, authHelperFunction_1.comparePassword)(password, user.password))) {
        return next(new appError_1.default("Invalid email or password", 401));
    }
    (0, authHelperFunction_1.responseAndToken)(user, res, 200);
}));
exports.editProfile = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.password &&
        (!req.body.confirmPassword || !req.body.currentPassword)) {
        return next(new appError_1.default("please enter your current password", 400));
    }
    let password = null;
    let user = yield userModel_1.default.findById(req.user.id);
    if (req.body.password) {
        password = yield bcrypt_1.default.hash(req.body.password, 10);
    }
    let same = yield bcrypt_1.default.compare(req.body.currentPassword, user.password);
    if (!same) {
        return next(new appError_1.default("wrong password", 400));
    }
    let update = {
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
    yield userModel_1.default.findByIdAndUpdate(req.user.id, update);
    const token = jsonwebtoken_1.default.sign(update, "HS256", {
        expiresIn: "24h",
    });
    return res.status(200).json(token);
}));
exports.forgetPassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { id, OTP, password, confirmPassword } = req.body;
    if (!id)
        return next(new appError_1.default("wrong data", 400));
    if (!OTP)
        return next(new appError_1.default("Wrong data", 400));
    if (!password)
        return next(new appError_1.default("please enter your password", 400));
    if (confirmPassword != password)
        return next(new appError_1.default("passwords don't match", 400));
    let user = yield userModel_1.default.findOne({ _id: id, OTP: OTP });
    if (!user) {
        return next(new appError_1.default("wrong data", 400));
    }
    else {
        let hashed = yield bcrypt_1.default.hash(password, 10);
        const code = speakeasy_1.default.totp({
            secret: secret.base32,
            encoding: "base32",
        });
        yield userModel_1.default.findOneAndUpdate({ _id: id, OTP: OTP }, { OTP: code, password: hashed });
        return res.status(200).json("password changed successfully");
    }
}));
exports.sendForgetMail = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, locale } = req.body;
    let check = validateEmail(email);
    if (!check)
        return next(new appError_1.default("please enter a valid email", 400));
    const user = yield userModel_1.default.findOne({ email: email });
    if (!user) {
        return next(new appError_1.default("email doesn't exist", 400));
    }
    const code = speakeasy_1.default.totp({
        secret: secret.base32,
        encoding: "base32",
    });
    user.OTP = code;
    let base = process.env.Frontend_Link;
    const url = `${base}/${locale}/resetPassword/${user._id}/${user.OTP}`;
    (0, sendMails_1.default)("اعاده تعيين كلمه السر", `<h4>اضغط علي الرابط التالي لاعاده تعيين كلمه المرر</h4><a href=${url}>${url}<a/> <h4>فريق [Auto Drop]</h4>`, email);
    user.save();
    return res.status(200).json("message sent");
}));
const generateProfile = (userProfile) => __awaiter(void 0, void 0, void 0, function* () {
    let email = userProfile._json.email, name = userProfile._json.name;
    console.log(email);
    let user = yield userModel_1.default.findOne({ email: email }), token = null;
    if (user) {
        let tmp = {
            name: user.name,
            image: user.image,
            id: user._id,
            email: user.email,
            phone: user.phone,
            country: user.country,
        };
        token = jsonwebtoken_1.default.sign(tmp, "HS256");
    }
    else {
        let randm = Math.floor(Math.random() * 10000) + 1;
        let pass = "quflpdj" + randm, original;
        original = pass;
        pass = yield bcrypt_1.default.hash(pass, 10);
        user = yield userModel_1.default.create({
            email: email,
            name: name,
            password: pass,
            image: userProfile._json.picture,
        });
        token = jsonwebtoken_1.default.sign({
            _id: user._id,
            email: email,
            name: name,
            password: pass,
            image: userProfile._json.picture,
        }, "HS256");
        (0, sendMails_1.default)("👋 ترحيب", `<h1>مرحبًا بك في موقعنا 👋</h1><h3>عزيزي ${name}</h3><h3>شكرًا لانضمامك إلى موقعنا. نحن سعداء لكونك عضوًا في مجتمعنا.</h3><h3>الرقم السري الخاصك بيك هو ${original}</h3><h3>يُرجى النظر حولك واستكشاف جميع الميزات التي نقدمها. إذا كان لديك أي أسئلة أو مشاكل، فلا تتردد في الاتصال بنا.</h3><h3>مرة أخرى، نرحب بك في موقعنا!</h3><h3>أطيب التحيات،</h3> <h3>فريق [Auto Drop]</h3>`, email);
    }
    return token;
});
exports.generateProfile = generateProfile;
