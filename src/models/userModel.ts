import mongoose from "mongoose";

const userModel = new mongoose.Schema(
  {
    name: { type: String, required: true, maxLength: 40 },
    email: { type: String, required: true, maxLength: 40 },
    password: { type: String, required: true, maxLength: 150 },
    role: { type: String, default: "client", enum: ["admin", "client"] },
    image: {
      type: String,
      default:
        "https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2247726673.jpg",
    },
    phone: { type: String, default: null, maxLength: 25 },
    country: { type: String, default: null, maxLength: 25 },
    merchantID: { type: Number, default: null, maxLength: 25 },
    storeName: { type: String, default: null, maxLength: 50 },
    storeLink: { type: String, default: null, maxLength: 50 },
    OTP: { type: String, maxLength: 10 },
  },
  { timestamps: true }
);
const User = mongoose.model("User", userModel);

export default User;
