
import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";

const app: Application = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", async (req: Request, res: Response)=>{
    res.send("Hello, RestNest!");
})

export default app;