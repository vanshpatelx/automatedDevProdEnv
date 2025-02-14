// storing variables centrally
import dotenv from "dotenv";

dotenv.config();

export const config = {
    redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD
    },
    JWT_SECRET: {
        secret: String(process.env.JWT_SECRET)
    },
    db: {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT)
    },
    port: Number(process.env.PORT),
    rabbitmq: {
        user: process.env.RABBITMQ_USER || "admin",
        password: process.env.RABBITMQ_PASSWORD || "password",
        host: process.env.RABBITMQ_HOST || "localhost",
        port: Number(process.env.RABBITMQ_PORT) || 5672,
        get url() {
            return `amqp://${this.user}:${this.password}@${this.host}:${this.port}`;
        },
        exchanges: (process.env.RABBITMQ_EXCHANGES || "auth_exchange,dlx_exchange").split(",") // Supports multiple exchanges
    }
};


export const loadEnv = () => {
    console.log("==================================");
    console.log("🚀 Application Environment Variables");
    console.log("==================================\n");

    console.log("🔹 REDIS CONFIGURATION:");
    console.log("   ➤ REDIS_HOST      :", process.env.REDIS_HOST);
    console.log("   ➤ REDIS_PORT      :", process.env.REDIS_PORT);
    console.log("   ➤ REDIS_PASSWORD  :", process.env.REDIS_PASSWORD);
    console.log("\n");

    console.log("🔹 JWT CONFIGURATION:");
    console.log("   ➤ JWT_SECRET      :", process.env.JWT_SECRET);
    console.log("\n");

    console.log("🔹 DATABASE CONFIGURATION:");
    console.log("   ➤ DB_USER         :", process.env.DB_USER);
    console.log("   ➤ DB_HOST         :", process.env.DB_HOST);
    console.log("   ➤ DB_NAME         :", process.env.DB_NAME);
    console.log("   ➤ DB_PASSWORD     :", process.env.DB_PASSWORD);
    console.log("   ➤ DB_PORT         :", process.env.DB_PORT);
    console.log("\n");

    console.log("🔹 SERVER PORT:");
    console.log("   ➤ AUTH_PORT         :", process.env.PORT);
    console.log("\n");

    console.log("==================================");
    console.log("✅ Environment variables loaded!");
    console.log("==================================");

}