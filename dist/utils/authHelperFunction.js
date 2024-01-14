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
exports.createPasswordResetToken = exports.verifyAccessToken = exports.responseAndToken = exports.createAccessToken = exports.comparePassword = exports.hashPassword = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = require("bcrypt");
const util_1 = require("util");
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield (0, bcrypt_1.hash)(password, 12);
    return hashedPassword;
});
exports.hashPassword = hashPassword;
const comparePassword = (password, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const isMatch = yield (0, bcrypt_1.compare)(password, hashedPassword);
    return isMatch;
});
exports.comparePassword = comparePassword;
const createAccessToken = (id) => {
    return (0, jsonwebtoken_1.sign)({ id }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    });
};
exports.createAccessToken = createAccessToken;
const responseAndToken = (user, res, statusCode) => {
    const accessToken = (0, exports.createAccessToken)(user.id);
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() +
            Number(process.env.JWT_ACCESS_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === "production",
    };
    res.cookie("accessToken", accessToken, cookieOptions);
    res.status(statusCode).json({
        status: "success",
        data: {
            accessToken,
            user,
        },
    });
};
exports.responseAndToken = responseAndToken;
const verifyAccessToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    let payload = null;
    try {
        payload = yield (0, util_1.promisify)(jsonwebtoken_1.verify)(token, 
        // @ts-ignore
        process.env.JWT_ACCESS_SECRET);
    }
    catch (err) {
        return null;
    }
    return payload;
});
exports.verifyAccessToken = verifyAccessToken;
const createPasswordResetToken = () => {
    const resetToken = crypto_1.default.randomBytes(6).toString("hex");
    const hashedResetToken = crypto_1.default
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    const resetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    return { resetToken, hashedResetToken, resetTokenExpiresAt };
};
exports.createPasswordResetToken = createPasswordResetToken;
