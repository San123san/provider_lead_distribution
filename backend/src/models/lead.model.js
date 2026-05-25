import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    service: {
        type: String,
        enum: ['Service 1', 'Service 2', 'Service 3'], 
        required: true
    },
    description: {
        type: String
    },
    assignedProviders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Provider"
    }]
}, {timestamps: true});

//Use to prevent duplicate leads
leadSchema.index({ phone: 1, service: 1}, { unique: true});

export const Lead = mongoose.model("Lead", leadSchema);