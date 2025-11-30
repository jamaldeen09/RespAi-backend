// ** Defines the structure of the envData object and the data being extracted from the .env file ** \\
export interface EnvData {
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    PORT: string;
    HOST_URL: string;
    MONGO_URI: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    OPENAI_API_KEY: string;
    FRONTEND_URL: string;
    GOOGLE_CALLBACK_URL: string;
};