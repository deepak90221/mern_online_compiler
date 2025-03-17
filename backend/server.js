import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import compilerRoutes from "./routes/compilerRoutes.js";

const app = express();
const PORT = 9001;

app.use(cors());
app.use(bodyParser.json());

app.use("/api/compiler", compilerRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
