import express, { Express, Request, Response } from "express";
import authRoutes from "./routes/auth";
import { config, loadEnv } from "./config/config";
import { initServices } from "./utils/init";
import { logger } from "./utils/logger";

loadEnv();

const app: Express = express();
const port = config.port;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/auth", authRoutes);

app.get("/auth", (req: Request, res: Response) => {
    res.send("🚀 🚀 Auth Server");
});

app.get('/auth/health', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "server is running." });
});

async function startServer() {
    try {
        await initServices();

        app.listen(port, () => {
            logger.info(`🚀 Server is running on port: ${port}`);
        });
    } catch (error) {
        logger.error("❌ Failed to start server:", error);
        process.exit(1);
    }
}
startServer();