import { Provider } from "../models/provider.model.js";
import { WebhookLog } from "../models/webhookLog.model.js";

export const resetQuotaWebhook = async (req, res) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ success: false, message: "Transaction ID is required" });
    }

    // 1. IDEMPOTENCY CHECK: Check(check if this transaction already processed)
    const existingLog = await WebhookLog.findOne({ transactionId });
    
    if (existingLog) {
      // Agar purani ID hai, toh 200 OK bhejo par database mein kuch change mat karo
      return res.status(200).json({
        success: true,
        message: "Webhook already processed (Idempotency applied). Quota remains unchanged.",
        idempotent: true
      });
    }

    // 2. If first time come, than log create
    await WebhookLog.create({ transactionId, status: "processed" });

    // 3. All providers quota is set to 10
    await Provider.updateMany({}, { $set: { quota: 10 } });

    // 4. Dashboard live update
    const io = req.app.get("io");
    if (io) {
      io.emit("dashboardUpdate"); 
    }

    return res.status(200).json({
      success: true,
      message: "Payment successful! All provider quotas reset to 10.",
      idempotent: false
    });

  } catch (error) {
    // Due to concurrent request, MongoDb give duplicate key(11000)
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: "Webhook already processed (caught by database unique index).",
        idempotent: true
      });
    }

    console.error("Webhook error details:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};