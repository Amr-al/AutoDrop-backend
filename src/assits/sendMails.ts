const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NodeMailerEmail,
    pass: process.env.NodeMailerPass,
  },
});
const sendMail = (sub:string, cont:string, to:string) => {
  let mailOptions = {
    from: "amrmohamed09@gmail.com",
    to: to,
    subject: sub,
    html: cont,
  };

  transporter.sendMail(mailOptions, function (error:any, info:any) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = sendMail
