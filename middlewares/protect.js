import jwt from "jsonwebtoken";

const userProtect = async (req, res, next) => {
  try {
    const token = req.cookies.jwt || req.headers.authentication.split(" ")[1];
    if (!token) {
      return res.json({ message: "Unauthorized" });
    }

    const data = jwt.verify(token, process.env.JSONWEBTOKEN_KEY);

    req.id = data.id;
    next();
  } catch (error) {
    return res.json({ message: error.message });
  }
};

export default userProtect;
