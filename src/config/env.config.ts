import { EnvData } from "../types/env.types";
import dotenv from "dotenv";

// ** Reads .env file ** \\
dotenv.config();

// ** Contains all .env data ** \\
export const envData: EnvData = {
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
    PORT: process.env.PORT!,
    HOST_URL: process.env.HOST_URL!,
    MONGO_URI: process.env.MONGO_URI!,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    FRONTEND_URL: process.env.FRONTEND_URL!,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL!,
}