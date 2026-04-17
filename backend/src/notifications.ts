import { Resend } from "resend";
import { env } from "./env";

const resend = new Resend(env.RESEND_API_KEY);

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

const EMAIL_TEMPLATE = (title: string, content: string) => `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px 20px; background-color: #f4f4f5; min-height: 100%;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <div style="background-color: #f97316; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Get2U Errand</h1>
      </div>
      <div style="padding: 32px; text-align: center;">
        <h2 style="color: #18181b; margin-top: 0;">${title}</h2>
        <p style="color: #52525b; font-size: 16px; line-height: 24px;">${content}</p>
        <div style="margin-top: 32px;">
          <a href="https://get2uerrand.com" style="background-color: #f97316; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">Open Application</a>
        </div>
      </div>
      <div style="background-color: #fafafa; padding: 20px; border-top: 1px solid #f4f4f5; text-align: center;">
        <p style="color: #a1a1aa; font-size: 12px; margin: 0;">&copy; 2026 Get2U Errand Service. All rights reserved.</p>
      </div>
    </div>
  </div>
`;

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
    await resend.emails.send({
      from: "Get2U Admin <notifications@get2uerrand.com>",
      to: env.ADMIN_EMAIL,
      subject: `New ${label(order.serviceType)} Request`,
      html: EMAIL_TEMPLATE(
        "New Order Received",
        `<b>${order.customer.name}</b> (${order.customer.email}) has just requested a <b>${label(order.serviceType)}</b> service.<br><br>Location: ${order.pickupAddress || order.carLocation || "Not specified"}`
      ),
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
    await resend.emails.send({
      from: "Get2U Errand <support@get2uerrand.com>",
      to: order.customer.email,
      subject: "Order Accepted!",
      html: EMAIL_TEMPLATE(
        "Agent Assigned",
        `Hi ${order.customer.name.split(' ')[0]}, your <b>${label(order.serviceType)}</b> request has been accepted by <b>${order.agent.name}</b>. They are on their way!`
      ),
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
    await resend.emails.send({
      from: "Get2U Errand <support@get2uerrand.com>",
      to: order.customer.email,
      subject: "Order Completed!",
      html: EMAIL_TEMPLATE(
        "Service Finished",
        `Hi ${order.customer.name.split(' ')[0]}, your <b>${label(order.serviceType)}</b> service is now complete. Thank you for using Get2U!`
      ),
    });
  } catch (err) {
    console.error("[notify] Failed to send customer completed email:", err);
  }
}
