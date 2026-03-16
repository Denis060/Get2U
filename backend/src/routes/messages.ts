import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../prisma";
import { auth } from "../auth";
import { SendMessageSchema } from "../types";

type AuthVariables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

type UserWithRole = typeof auth.$Infer.Session.user & { role: string };

const messagesRouter = new Hono<{ Variables: AuthVariables }>();

// GET /api/orders/:orderId/messages — Get all messages for an order
messagesRouter.get("/", async (c) => {
  const user = c.get("user") as UserWithRole | null;
  if (!user) {
    return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  }

  const orderId = c.req.param("orderId") as string;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return c.json({ error: { message: "Order not found", code: "NOT_FOUND" } }, 404);
  }

  // Access control
  if (user.role === "customer" && order.customerId !== user.id) {
    return c.json({ error: { message: "Forbidden", code: "FORBIDDEN" } }, 403);
  }
  if (user.role === "agent" && order.agentId !== user.id) {
    return c.json({ error: { message: "Forbidden", code: "FORBIDDEN" } }, 403);
  }
  // admin can access all

  const messages = await prisma.message.findMany({
    where: { orderId },
    include: {
      sender: { select: { id: true, name: true, email: true, image: true, role: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return c.json({ data: messages });
});

// POST /api/orders/:orderId/messages — Send a message
messagesRouter.post("/", zValidator("json", SendMessageSchema), async (c) => {
  const user = c.get("user") as UserWithRole | null;
  if (!user) {
    return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  }

  const orderId = c.req.param("orderId") as string;
  const { content } = c.req.valid("json");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return c.json({ error: { message: "Order not found", code: "NOT_FOUND" } }, 404);
  }

  // Access control
  if (user.role === "customer" && order.customerId !== user.id) {
    return c.json({ error: { message: "Forbidden", code: "FORBIDDEN" } }, 403);
  }
  if (user.role === "agent" && order.agentId !== user.id) {
    return c.json({ error: { message: "Forbidden", code: "FORBIDDEN" } }, 403);
  }
  // admin can send to any order

  const message = await prisma.message.create({
    data: {
      orderId,
      senderId: user.id,
      content,
    },
    include: {
      sender: { select: { id: true, name: true, email: true, image: true, role: true } },
    },
  });

  return c.json({ data: message }, 201);
});

export { messagesRouter };

