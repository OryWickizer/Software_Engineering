import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import auth from "./routes/auth.routes.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", routes);
app.use("/api/auth", auth);

export default app;
