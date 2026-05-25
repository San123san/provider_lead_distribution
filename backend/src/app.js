//app.js
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.routes.js'

import dns from "node:dns/promises";

dns.setServers(["1.1.1.1", "1.0.0.1"]);

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json())   
app.use(express.urlencoded({extended: true, limit:"16kb"}))
app.use(express.static("./dist"));

app.use("/api/v1", apiRoutes);


export {app}