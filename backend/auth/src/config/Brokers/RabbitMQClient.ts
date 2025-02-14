import amqp, { Connection, Channel } from "amqplib";
import { config } from "../config";
import { logger } from "../../utils/logger";

class RabbitMQClient {
    private static instance: RabbitMQClient | null = null;
    private connection: Connection | null = null;
    private channel: Channel | null = null;

    private constructor() {}

    public static async getInstance(): Promise<RabbitMQClient> {
        if (!RabbitMQClient.instance) {
            RabbitMQClient.instance = new RabbitMQClient();
            await RabbitMQClient.instance.connect();
        }
        return RabbitMQClient.instance;
    }

    private async connect(): Promise<void> {
        try {
            this.connection = await amqp.connect(config.rabbitmq.url);
            this.channel = await this.connection.createChannel();

            // for (const exchange of config.rabbitmq.exchanges) {
            //     await this.channel.assertExchange(exchange, "direct", { durable: true });
            // }

            logger.info({
                message: `✅ Connected to RabbitMQ at ${config.rabbitmq.url}`,
                service: "rabbitmq",
            });

            this.connection.on("close", () => {
                logger.error({
                    message: "❌ RabbitMQ connection closed. Reconnecting...",
                    service: "rabbitmq",
                });
                this.reconnect();
            });

            this.connection.on("error", (error) => {
                logger.error({
                    message: "⚠️ RabbitMQ connection error",
                    service: "rabbitmq",
                    error: error.message,
                });
            });
        } catch (error: any) {
            logger.error({
                message: "❌ Failed to connect to RabbitMQ",
                service: "rabbitmq",
                error: error.message,
            });
            this.reconnect();
        }
    }

    private async reconnect(): Promise<void> {
        this.connection = null;
        this.channel = null;
        setTimeout(() => this.connect(), 5000); // Retry after 5 sec
    }

    public async publish(exchange: string, routingKey: string, message: object): Promise<void> {
        if (!this.channel) {
            logger.error({
                message: "❌ RabbitMQ channel not initialized. Cannot publish.",
                service: "rabbitmq",
            });
            return;
        }

        const msgBuffer = Buffer.from(JSON.stringify(message));
        this.channel.publish(exchange, routingKey, msgBuffer, {
            persistent: true,
        });

        logger.info({
            message: `📤 Published event to ${exchange} with key '${routingKey}'`,
            service: "rabbitmq",
            data: message,
        });
    }

    public async registerUser(userId: bigint, email: string, hashedPassword: string) {
        await this.publish("auth_exchange", "auth.registered", {
            event: "UserRegistered",
            id: userId.toString(),
            email,
            password: hashedPassword,
        });
    }
}

// Initialize RabbitMQClient and export
const rabbitMQClientPromise = RabbitMQClient.getInstance();
export { rabbitMQClientPromise };
