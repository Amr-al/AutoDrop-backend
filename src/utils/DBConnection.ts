const mongoose = require("mongoose");
exports.conect = async () => {
  try {
    console.log(process.env.DB_URL);
    mongoose
      .connect(process.env.DB_URL, {})
      .then(() => {
        console.log("database Connected");
      })
      .catch((error: any) => {
        console.log(error);
      });
  } catch (err) {
    console.log(err);
  }
};
