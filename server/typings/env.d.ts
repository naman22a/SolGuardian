declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: string;
            PORT: string;
            CLIENT_URL: string;
            REDIS_HOST: string;
            REDIS_PORT: string;
        }
    }
}

export {};
