import { sign, verify } from "jsonwebtoken";
import crypto from "crypto";
import { Response } from "express";
import { hash, compare } from "bcrypt";
import { promisify } from "util";

export const hashPassword = async (password: string) => {
  const hashedPassword = await hash(password, 12);
  return hashedPassword;
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
) => {
  const isMatch = await compare(password, hashedPassword);
  return isMatch;
};

export const createAccessToken = (id: number) => {
  return sign({ id }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  });
};

export const responseAndToken = (
  user: any,
  res: Response,
  statusCode: number
) => {
  const accessToken = createAccessToken(user.id);

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_ACCESS_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    secure: process.env.NODE_ENV === "production",
  };

  res.cookie("accessToken", accessToken, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    data: {
      accessToken,
      user,
    },
  });
};

export const verifyAccessToken = async (token: string) => {
  let payload: any = null;

  try {
    payload = await promisify(verify)(
      token,
      // @ts-ignore
      process.env.JWT_ACCESS_SECRET!
    );
  } catch (err) {
    return null;
  }

  return payload;
};

export const createPasswordResetToken = () => {
  const resetToken = crypto.randomBytes(6).toString("hex");
  const hashedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const resetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  return { resetToken, hashedResetToken, resetTokenExpiresAt };
};
