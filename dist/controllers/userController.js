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
const userModel_1 = __importDefault(require("../models/userModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const speakeasy_1 = __importDefault(require("speakeasy"));
const sendMails_1 = __importDefault(require("../assits/sendMails"));
const secret = speakeasy_1.default.generateSecret({ length: 20 });
let validateEmail = function (email) {
    let re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, role } = req.body;
        if (!name) {
            return res.status(400).json("please enter your name");
        }
        if (!email) {
            return res.status(400).json("please enter your email");
        }
        if (!validateEmail(email)) {
            return res.status(400).json("please enter your valid email");
        }
        if (!password) {
            return res.status(400).json("please enter your password");
        }
        let check = yield userModel_1.default.findOne({ email: email });
        if (check) {
            return res.status(400).json("this email is already exists");
        }
        let token;
        let hashed = yield bcrypt_1.default.hash(password, 10);
        let user = yield userModel_1.default.create({
            name,
            email,
            password: hashed,
            role,
        });
        token = jsonwebtoken_1.default.sign({
            name,
            email,
            image: "https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2247726673.jpg",
            role: role ? role : "client",
            id: user._id,
            password: hashed,
        }, "HS256", {
            expiresIn: "24h",
        });
        return res.status(200).json(token);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json("something went wrong");
    }
});
exports.signUp = signUp;
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email) {
            return res.status(400).json("please enter your email");
        }
        if (!password) {
            return res.status(400).json("please enter your password");
        }
        const user = yield userModel_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json("email is wrong");
        }
        console.log(user);
        bcrypt_1.default.compare(password, user.password).then((same) => __awaiter(void 0, void 0, void 0, function* () {
            if (!same) {
                return res.status(400).json("the password is wrong");
            }
            const token = jsonwebtoken_1.default.sign({
                name: user.name,
                id: user._id,
                role: user.role,
                image: user.image,
                phone: user.phone,
                country: user.country,
                storeName: user.storeName,
                storeLink: user.storeLink,
                merchantID: user.merchantID,
                password: user.password,
            }, "HS256", {
                expiresIn: "24h",
            });
            return res.status(200).json(token);
        }));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json("something went wrong");
    }
});
exports.signIn = signIn;
const editProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.body.password &&
            (!req.body.confirmPassword || !req.body.currentPassword)) {
            return res.status(400).json("make sure that you entered a correct data");
        }
        let password = null;
        let user = yield userModel_1.default.findById(req.user.id);
        if (req.body.password) {
            password = yield bcrypt_1.default.hash(req.body.password, 10);
        }
        let same = yield bcrypt_1.default.compare(req.body.currentPassword, user.password);
        if (!same) {
            return res.status(400).json("current password is wrong");
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
    }
    catch (error) {
        console.log(error);
        return res.status(500).json("something went wrong");
    }
});
exports.editProfile = editProfile;
const forgetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { id, OTP, password, confirmPassword } = req.body;
    if (!id)
        return res.status(400).json("wrong data");
    if (!OTP)
        return res.status(400).json("wrong data");
    if (!password)
        return res.status(400).json("the password is missing");
    if (confirmPassword != password)
        return res.status(400).json("the two passwords are not the same");
    try {
        let user = yield userModel_1.default.findOne({ _id: id, OTP: OTP });
        if (!user) {
            return res.status(400).json("user doesn't exist");
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
    }
    catch (err) {
        console.log(err);
        return res.status(500).json("something went wrong");
    }
});
exports.forgetPassword = forgetPassword;
const sendForgetMail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        let check = validateEmail(email);
        if (!check)
            return res.status(400).json("Please enter a valid email");
        const user = yield userModel_1.default.findOne({ email: email });
        if (!user) {
            return res.status(400).json("User doesn't exist");
        }
        const code = speakeasy_1.default.totp({
            secret: secret.base32,
            encoding: "base32",
        });
        user.OTP = code;
        let base = process.env.Frontend_Link;
        const url = `${base}/resetpassword/${user._id}/${user.OTP}`;
        (0, sendMails_1.default)("اعاده تعيين كلمه السر", `<h4>اضغط علي الرابط التالي لاعاده تعيين كلمه المرر</h4><a href=${url}>${url}<a/> <h4>فريق [Auto Drop]</h4>`, email);
        user.save();
        return res.status(200).json("message sent");
    }
    catch (err) {
        console.log(err);
        return res.status(500).json("something went wrong");
    }
});
exports.sendForgetMail = sendForgetMail;
const generateProfile = (userProfile) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log(userProfile);
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
