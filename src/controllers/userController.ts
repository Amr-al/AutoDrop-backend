const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const secret = speakeasy.generateSecret({ length: 20 });
const sendEmail = require("../assits/sendMails");
let validateEmail = function (email: string) {
  let re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};
const signUp = async (req: any, res: any) => {
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
    let check = await User.findOne({ email: email });
    if (check) {
      return res.status(400).json("this email is already exists");
    }

    let token: string;
    let hashed = await bcrypt.hash(password, 10);
    let user = await User.create({
      name,
      email,
      password: hashed,
      role,
    });
    token = jwt.sign(
      {
        name,
        email,
        image:
          "https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2247726673.jpg",
        role: role ? role : "client",
        id: user._id,
        password: hashed,
      },
      "HS256",
      {
        expiresIn: "24h",
      }
    );
    return res.status(200).json(token);
  } catch (error) {
    console.log(error);
    return res.status(500).json("something went wrong");
  }
};

const signIn = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json("please enter your email");
    }
    if (!password) {
      return res.status(400).json("please enter your password");
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json("email is wrong");
    }
    console.log(user);
    bcrypt.compare(password, user.password).then(async (same: boolean) => {
      if (!same) {
        return res.status(400).json("the password is wrong");
      }
      const token: string = jwt.sign(
        {
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
        },
        "HS256",
        {
          expiresIn: "24h",
        }
      );
      return res.status(200).json(token);
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("something went wrong");
  }
};

const editProfile = async (req: any, res: any) => {
  try {
    if (
      req.body.password &&
      (!req.body.confirmPassword || !req.body.currentPassword)
    ) {
      return res.status(400).json("make sure that you entered a correct data");
    }
    let password = null;
    let user = await User.findById(req.user.id);
    if (req.body.password) {
      password = await bcrypt.hash(req.body.password, 10);
    }
    let same: boolean = await bcrypt.compare(
      req.body.currentPassword,
      user.password
    );
    if (!same) {
      return res.status(400).json("current password is wrong");
    }
    let update: Object = {
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
    await User.findByIdAndUpdate(req.user.id, update);
    const token: string = jwt.sign(update, "HS256", {
      expiresIn: "24h",
    });
    return res.status(200).json(token);
  } catch (error) {
    console.log(error);
    return res.status(500).json("something went wrong");
  }
};

const forgetPassword = async (req: any, res: any) => {
  let { id, OTP, password, confirmPassword } = req.body;
  if (!id) return res.status(400).json("wrong data");
  if (!OTP) return res.status(400).json("wrong data");
  if (!password) return res.status(400).json("the password is missing");
  if (confirmPassword != password)
    return res.status(400).json("the two passwords are not the same");
  try {
    let user = await User.findOne({ _id: id, OTP: OTP });
    if (!user) {
      return res.status(400).json("user doesn't exist");
    } else {
      let hashed: string = await bcrypt.hash(password, 10);
      const code = speakeasy.totp({
        secret: secret.base32,
        encoding: "base32",
      });

      await User.findOneAndUpdate(
        { _id: id, OTP: OTP },
        { OTP: code, password: hashed }
      );

      return res.status(200).json("password changed successfully");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json("something went wrong");
  }
};

const sendForgetMail = async (req: any, res: any) => {
  try {
    const { email } = req.body;
    let check = validateEmail(email);
    if (!check) return res.status(400).json("Please enter a valid email");
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json("User doesn't exist");
    }
    const code = speakeasy.totp({
      secret: secret.base32,
      encoding: "base32",
    });
    user.OTP = code;
    let base: string | undefined = process.env.Frontend_Link;
    const url = `${base}/resetpassword/${user._id}/${user.OTP}`;
    sendEmail(
      "اعاده تعيين كلمه السر",
      `<h4>اضغط علي الرابط التالي لاعاده تعيين كلمه المرر</h4><a href=${url}>${url}<a/> <h4>فريق [Auto Drop]</h4>`,
      email
    );
    user.save();
    return res.status(200).json("message sent");
  } catch (err) {
    console.log(err);
    return res.status(500).json("something went wrong");
  }
};

const generateProfile = async (userProfile: any): Promise<string> => {
  let email = userProfile.emails[0].value,
    name = userProfile.displayName;
  let user = await User.findOne({ email: email }),
    token = null;
  if (user) {
    let tmp = {
      name: user.name,
      image: user.image,
      id: user._id,
      email: user.email,
      phone: user.phone,
      country: user.cou,
    };
    token = jwt.sign(tmp, "HS256");
  } else {
    let randm = Math.floor(Math.random() * 10000) + 1;
    let pass = "quflpdj" + randm,
      original;
    original = pass;
    pass = await bcrypt.hash(pass, 10);
    user = await User.create({
      email: email,
      name: name,
      password: pass,
      image: userProfile.photos[0].value,
    });
    token = jwt.sign(
      {
        _id: user._id,
        email: email,
        name: name,
        password: pass,
        image: userProfile.photos[0].value,
      },
      "HS256"
    );
    sendEmail(
      "👋 ترحيب",
      `<h1>مرحبًا بك في موقعنا 👋</h1><h3>عزيزي ${name}</h3><h3>شكرًا لانضمامك إلى موقعنا. نحن سعداء لكونك عضوًا في مجتمعنا.</h3><h3>الرقم السري الخاصك بيك هو ${original}</h3><h3>يُرجى النظر حولك واستكشاف جميع الميزات التي نقدمها. إذا كان لديك أي أسئلة أو مشاكل، فلا تتردد في الاتصال بنا.</h3><h3>مرة أخرى، نرحب بك في موقعنا!</h3><h3>أطيب التحيات،</h3> <h3>فريق [Auto Drop]</h3>`,
      email
    );
  }
  return token;
};
module.exports = {
  signUp,
  signIn,
  editProfile,
  sendForgetMail,
  forgetPassword,
  generateProfile,
};
export {};
