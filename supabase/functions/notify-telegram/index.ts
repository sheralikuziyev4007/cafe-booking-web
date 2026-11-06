// Sends a Telegram message to the owner when a visitor creates a booking or a contact message.
// Triggered by Supabase Database Webhooks (see README -> "Telegram notifications").
import {
  buildSendMessageRequest,
  formatNotification,
  isAuthorized,
  parseWebhookPayload,
} from "../_shared/telegram.ts";

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const secret = Deno.env.get("WEBHOOK_SECRET") ?? "";
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
  const chatId = Deno.env.get("TELEGRAM_CHAT_ID") ?? "";
  if (!secret || !token || !chatId) return json(500, { error: "Function secrets are not configured" });

  if (!isAuthorized(req.headers.get("x-webhook-secret"), secret)) return json(401, { error: "Unauthorized" });

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: "Body must be JSON" });
  }

  const event = parseWebhookPayload(payload);
  // Updates, deletes and other tables are not an error: answer 200 so the webhook does not retry
  if (!event) return json(200, { skipped: true });

  const { url, init } = buildSendMessageRequest(token, chatId, formatNotification(event));
  try {
    const response = await fetch(url, { ...init, signal: AbortSignal.timeout(8000) });
    if (!response.ok) {
      // Log the status only: the response body and URL must never contain the bot token
      console.error(`Telegram answered with HTTP ${response.status}`);
      return json(502, { error: "Telegram rejected the message" });
    }
  } catch {
    console.error("Telegram request failed");
    return json(502, { error: "Could not reach Telegram" });
  }

  return json(200, { sent: true });
});
