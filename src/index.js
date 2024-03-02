//require("dotenv").config({ path: "./env" }); --> normal require statement

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
  path: "./env",
});

connectDB()
.then(() => {
  app.on("error", (err) => {
    console.error("Error Occured while running the server",err);
  });
  app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
.catch((err) => {
  console.log("Server problem",err)
});
