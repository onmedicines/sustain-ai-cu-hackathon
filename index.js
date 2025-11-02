import e from "express";
import cors from "cors";
import { config } from "dotenv";
import { analyzeWebsite } from "./main.js";
config();
const app = e();

app.use(cors());
app.use(e.json());
app.use(e.urlencoded({ extended: true }));

app.get("/", (req, res) => res.json({ hello: "world" }));
app.post("/", async (req, res) => {
  try {
    const { url } = req.body;
    const analysis = await analyzeWebsite(url);

    return res.json({ analysis });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});
// test

app.listen(process.env.PORT, () => {
  console.log(`server running on port ${process.env.PORT}`);
});
