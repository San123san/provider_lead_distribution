import mongoose from "mongoose";

const providerSchema = new mongoose.Schema({
    providerId: {
        type: Number,
        required: true,
        unique: true
    },

    name: {
        type: String, required: true
    },

    quota: {
        type: Number, default: 10, min: 0

    },

    //This is in array format
    mandatoryFor: [{
        type: String
    }],
    poolFor: [{
        type: String
    }],

    //To track last assigned timestamp
    lastAssignedAt: {
        type: Date,
        default: null
    }
},
    { timestamps: true }
);

export const Provider = mongoose.model("Provider", providerSchema);