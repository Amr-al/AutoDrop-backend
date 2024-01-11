"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.NodeMailerEmail,
        pass: process.env.NodeMailerPass,
    },
});
const sendMail = (sub, cont, to) => {
    let mailOptions = {
        from: "support@autodrop.me",
        to: to,
        subject: sub,
        html: cont,
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        }
        else {
            console.log("Email sent: " + info.response);
        }
    });
};
exports.default = sendMail;
