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
exports.conect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const conect = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(process.env.DB_URL, process.env.GOOGLE_CLIENT_ID);
        mongoose_1.default
            .connect(process.env.DB_URL, {})
            .then(() => {
            console.log("database Connected");
        })
            .catch((error) => {
            console.log(error);
        });
    }
    catch (err) {
        console.log(err);
    }
});
exports.conect = conect;
