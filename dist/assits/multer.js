"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const multer = require('multer');
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
    secure: true,
});
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "AutoDrop",
    },
});
const upload = multer({ storage: storage });
module.exports = upload;
