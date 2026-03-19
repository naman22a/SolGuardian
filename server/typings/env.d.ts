declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: string;
            PORT: string;
            CLIENT_URL: string;
            REDIS_HOST: string;
            REDIS_PORT: string;
            MONGO_URI: string;
            OLLAMA_URL: string;
            OLLAMA_MODEL: string;
        }
    }
}

export {};
