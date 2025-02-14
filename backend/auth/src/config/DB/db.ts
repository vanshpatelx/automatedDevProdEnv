import { Pool } from "pg";
import { config } from "../config";
import { logger } from "../../utils/logger";

class PostgresClient {
    private static instance: Pool | null = null;

    private constructor() {}

    public static getInstance(): Pool {
        if (!PostgresClient.instance) {
            PostgresClient.instance = new Pool({
                host: config.db.host,
                port: config.db.port,
                user: config.db.user,
                password: config.db.password,
                database: config.db.database,
            });
            
            PostgresClient.instance.on("connect", () => {
                logger.info({
                    message: `Connected to PostgreSQL at ${config.db.host}:${config.db.port}`,
                    service: "postgres",
                });
            });

            PostgresClient.instance.on("error", (error) => {
                logger.error({
                    message: "PostgreSQL connection error",
                    service: "postgres",
                    error: error.message,
                });
            });

        }
        return PostgresClient.instance;
    }
}

const postgresClient = PostgresClient.getInstance();
export { postgresClient };
