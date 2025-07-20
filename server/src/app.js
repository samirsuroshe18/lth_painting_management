import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import { errorHandler } from "./utils/errorHandler.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticPath = path.join(__dirname, '../public');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

// this use for cross origin sharing 
app.use(
  cors({
      origin: process.env.CORS_ORIGIN, // Allow frontend origin
      methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
      allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
      credentials: true, // Allow cookies/auth headers if needed
  })
);
// this middleware use for parsing the json data
app.use(express.json());
// this is used for parsing url data extended is used for nessted object
app.use(express.urlencoded({ extended: true }));
// this is used for accessing public resources from server
app.use(express.static(staticPath));
// this is used to parse the cookie
app.use(cookieParser());

// routes import
import userRouter from './routes/user.routes.js';
import verifyRouter from './routes/verify.routes.js';
import userMasterRouter from './routes/userMaster.routes.js';
import stateMasterRouter from './routes/stateMaster.routes.js';
import locationMasterRouter from './routes/locationMaster.routes.js';
import assetMasterRouter from './routes/assetMaster.routes.js';

//Routes declaration
app.use("/api/v1/user", userRouter);
app.use("/api/v1/verify", verifyRouter);
app.use("/api/v1/usermaster", userMasterRouter);
app.use("/api/v1/statemaster", stateMasterRouter);
app.use("/api/v1/locationmaster", locationMasterRouter);
app.use("/api/v1/assetmaster", assetMasterRouter);

// Custom error handeling
app.use(errorHandler)

export default app