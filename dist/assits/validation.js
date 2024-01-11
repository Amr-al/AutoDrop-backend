"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validation = (req, res, next) => {
    const auth = req.headers["authorization"];
    if (auth == null) {
        return res.status(400).json("not authorized");
    }
    const token = auth;
    if (token == null) {
        return res.status(401).json("not authorized");
    }
    jsonwebtoken_1.default.verify(token, "HS256", (err, user) => {
        if (err) {
            return res.status(400).json("not valid token");
        }
        if (user.user) {
            if (Array.isArray(user.user))
                req.user = user.user[0];
            else
                req.user = user.user;
        }
        else
            req.user = user;
        next();
    });
};
exports.validation = validation;
