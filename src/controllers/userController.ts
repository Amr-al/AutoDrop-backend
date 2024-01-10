const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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
module.exports = { signUp, signIn, editProfile };
export {};
