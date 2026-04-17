import { Hono } from "hono";
import { cors } from "hono/cors";
import "./env";
import { logger } from "hono/logger";
import { auth } from "./auth";
import { ordersRouter } from "./routes/orders";
import { vehiclesRouter } from "./routes/vehicles";
import { usersRouter } from "./routes/users";
import { messagesRouter } from "./routes/messages";
import { adminRouter } from "./routes/admin";
import { configRouter } from "./routes/config";
import { paymentsRouter } from "./routes/payments";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

// CORS middleware - validates origin against allowlist
const allowed = [
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https:\/\/[a-z0-9-]+\.dev\.vibecode\.run$/,
  /^https:\/\/[a-z0-9-]+\.vibecode\.run$/,
  /^https:\/\/[a-z0-9-]+\.vibecodeapp\.com$/,
  /^https:\/\/[a-z0-9-]+\.vibecode\.dev$/,
  /^https:\/\/vibecode\.dev$/,
  /^https:\/\/[a-z0-9-]+\.loca\.lt$/,
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
  /^https:\/\/get2uerrand\.com$/,
  /^https:\/\/www\.get2uerrand\.com$/,
];

app.use(
  "*",
  cors({
    origin: (origin) => (origin && allowed.some((re) => re.test(origin)) ? origin : null),
    credentials: true,
  })
);

// Logging
app.use("*", logger());

// Auth middleware - attach session to context
app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    c.set("user", null);
    c.set("session", null);
    await next();
    return;
  }
  c.set("user", session.user);
  c.set("session", session.session);
  await next();
});

// Health check endpoint
app.get("/health", (c) => c.json({ status: "ok" }));

// Auth handler
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// Routes
app.route("/api/orders", ordersRouter);
app.route("/api/vehicles", vehiclesRouter);
app.route("/api", usersRouter);
app.route("/api/orders/:orderId/messages", messagesRouter);
app.route("/api/admin", adminRouter);
import { serve } from "@hono/node-server";

app.route("/api/config", configRouter);
app.route("/api/payments", paymentsRouter);

const port = Number(process.env.PORT) || 3000;

if (process.env.NODE_ENV !== "test") {
  console.log(`Server is running on port ${port}`);
  serve({
    fetch: app.fetch,
    port
  });
}

export default {
  port,
  fetch: app.fetch,
};
