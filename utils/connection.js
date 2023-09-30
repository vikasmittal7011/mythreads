import { connect } from "mongoose";

export async function connection() {
  try {
    await connect(process.env.MONGODB_CONNECTION_URI);
    console.log("Connected");
  } catch (err) {
    console.loh(err.message);
  }
}
