import { postgresClient } from "../config/DB/db";
import { redisClient } from "../config/Cache/RedisClient";
import { logger } from "./logger";
import amqp from "amqplib";
import { config } from "../config/config";

async function checkPostgresConnection(): Promise<boolean> {
    return new Promise((resolve) => {
        postgresClient.query("SELECT 1", (err) => {
            if (err) {
                logger.error("PostgreSQL is not ready:", err.message);
                resolve(false);
            } else {
                logger.info("PostgreSQL is ready.");
                resolve(true);
            }
        });
    });
}

async function checkRedisConnection(): Promise<boolean> {
    return new Promise((resolve) => {
        redisClient.ping((err, result) => {
            if (err || result !== "PONG") {
                logger.error("Redis is not ready:", err?.message);
                resolve(false);
            } else {
                logger.info("Redis is ready.");
                resolve(true);
            }
        });
    });
}

async function checkRabbitMQConnection(): Promise<boolean> {
    try {
        const connection = await amqp.connect(config.rabbitmq.url);
        await connection.close();
        logger.info("RabbitMQ is ready.");
        return true;
    } catch (error: any) {
        logger.error("RabbitMQ is not ready:", error.message);
        return false;
    }
}

export async function initServices() {
    let retries = 5;
    while (retries > 0) {
        const dbReady = await checkPostgresConnection();
        const cacheReady = await checkRedisConnection();
        const rabbitMQReady = await checkRabbitMQConnection();

        if (dbReady && cacheReady && rabbitMQReady) {
            logger.info("✅ All services are ready!");
            return;
        }

        logger.warn(`Retrying service initialization (${retries} attempts left)...`);
        await new Promise((res) => setTimeout(res, 5000)); // Wait before retrying
        retries--;
    }

    throw new Error("❌ Services failed to initialize. Exiting...");
}