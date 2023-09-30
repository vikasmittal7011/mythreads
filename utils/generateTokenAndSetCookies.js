import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (id, res) => {
  const token = jwt.sign({ id }, process.env.JSONWEBTOKEN_KEY, {
    expiresIn: "15d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 15 * 24 * 60 * 60 * 1000,
    smaeSite: "strict",
  });

  return token;
};

export default generateTokenAndSetCookie;
