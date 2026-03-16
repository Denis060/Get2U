import { createVibecodeSDK } from "@vibecodeapp/backend-sdk";
import { env } from "./env";

const vibecode = createVibecodeSDK();

const SERVICE_LABELS: Record<string, string> = {
  send_mail: "Send Mail",
  send_package: "Send Package",
  pickup_dropoff: "Pickup & Drop-off",
  car_wash: "Car Wash",
  fueling: "Fueling",
  oil_change: "Oil Change",
  vehicle_help: "Vehicle Help",
};

function label(serviceType: string) {
  return SERVICE_LABELS[serviceType] ?? serviceType;
}

/** Notify admin when a new order is placed */
export async function notifyAdminNewOrder(order: {
  id: string;
  serviceType: string;
  category: string;
  pickupAddress?: string | null;
  carLocation?: string | null;
  customer: { name: string; email: string };
}) {
  if (!env.ADMIN_EMAIL) return;
  try {
    await vibecode.email.sendWelcome({
      to: env.ADMIN_EMAIL,
      name: `New ${label(order.serviceType)} request from ${order.customer.name} (${order.customer.email})`,
      appName: "Get2u Errand – Admin Alert",
      lang: "en",
    });
  } catch (err) {
    console.error("[notify] Failed to send admin new-order email:", err);
  }
}

/** Notify customer when their order is accepted by an agent */
export async function notifyCustomerOrderAccepted(order: {
  serviceType: string;
  customer: { name: string; email: string };
  agent: { name: string };
}) {
  try {
    await vibecode.email.sendWelcome({
      to: order.customer.email,
      name: `Your ${label(order.serviceType)} request has been accepted by ${order.agent.name}`,
      appName: "Get2u Errand",
      lang: "en",
    });
  } catch (err) {
    console.error("[notify] Failed to send customer accepted email:", err);
  }
}

/** Notify customer when their order is completed */
export async function notifyCustomerOrderCompleted(order: {
  serviceType: string;
  customer: { name: string; email: string };
}) {
  try {
    await vibecode.email.sendWelcome({
      to: order.customer.email,
      name: `Your ${label(order.serviceType)} request has been completed`,
      appName: "Get2u Errand",
      lang: "en",
    });
  } catch (err) {
    console.error("[notify] Failed to send customer completed email:", err);
  }
}
