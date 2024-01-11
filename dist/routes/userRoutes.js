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
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const userController_1 = require("../controllers/userController");
const multer_1 = __importDefault(require("../assits/multer"));
const router = (0, express_1.Router)();
router.post("/signup", userController_1.signUp);
router.post("/signin", userController_1.signIn);
router.patch("/edit", multer_1.default.single("file"), userController_1.editProfile);
router.post("/sendmail", userController_1.sendForgetMail);
router.patch("/forgetpassword", userController_1.forgetPassword);
/*  Google AUTH  */
router.get("/google", passport_1.default.authenticate("google", { scope: ["email", "profile"] }));
router.get("/google/callback", passport_1.default.authenticate("google", { failureRedirect: "/api/v1/auth/error" }), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.redirect(`${process.env.Frontend_Link}`);
}));
router.get("/error", (req, res) => {
    res.send("Something went wrong. try again");
});
exports.default = router;
