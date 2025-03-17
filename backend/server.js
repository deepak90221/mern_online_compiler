import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import compilerRoutes from "./routes/compilerRoutes.js";

const app = express();
const PORT = process.env.PORT || 9001; // 🔹 Allow Render to assign a port

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Welcome to the MERN Compiler Backend!");
});

app.use("/api/compiler", compilerRoutes);

app.listen(PORT, "0.0.0.0", () => { // 🔹 Allow external access
  console.log(`Server is running on port ${PORT}`);
});
