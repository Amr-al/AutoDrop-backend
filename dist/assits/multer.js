"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image") || file.mimetype.startsWith("video")) {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};
const upload = (0, multer_1.default)({ storage: storage, fileFilter: multerFilter });
exports.default = upload;
