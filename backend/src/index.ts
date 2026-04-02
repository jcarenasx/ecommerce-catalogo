import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { prisma } from "./prisma.js";
import authRouter from "./routes/auth.js";
import productsRouter from "./routes/products.js";
import cartRouter from "./routes/cart.js";
import mediaRouter from "./routes/media.js";
import availabilityRouter from "./routes/availability.js";
import customersRouter from "./routes/customers.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/products", productsRouter);
app.use("/cart", cartRouter);
app.use("/media", mediaRouter);
app.use("/availability", availabilityRouter);
app.use("/customers", customersRouter);

app.use(errorHandler);

async function startServer() {
  try {
    const PORT = Number(process.env.PORT) || 4000;

    const server = app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });

    // 🔥 Prisma ya NO bloquea el arranque
    prisma.$connect()
      .then(() => console.log("Prisma connected"))
      .catch((err) => console.error("Prisma connection failed:", err));

    const shutdown = async (signal: NodeJS.Signals) => {
      console.log(`Received ${signal}, shutting down`);
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start backend", error);
    await prisma.$disconnect().catch(() => undefined);
    process.exit(1);
  }
}

void startServer();