import mongoose from "mongoose";

const webhookLogSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        default: "processed"
    }
},
    { timestamps: true });

export const WebhookLog = mongoose.model("WebhookLog", webhookLogSchema);