import { Router } from "express";
import { createLead } from "../controllers/lead.controller.js";
import { getDashboardData } from "../controllers/provider.controller.js";
import { resetQuotaWebhook } from "../controllers/webhook.controller.js";
import { generateBulkLeads } from "../controllers/test.controller.js";
import { seedDatabase } from "../controllers/test.controller.js";

const router = Router();

// Feature 1: Public Customer Form Route
router.post("/request-service", createLead);

// Feature 3: Provider Dashboard Route
router.get("/dashboard", getDashboardData);

// Feature 5 (Part A): Webhook Simulation Route
router.post("/webhook/reset-quota", resetQuotaWebhook);

// Feature 5 (Part B): Testing Tool - Bulk Lead Generation Route
router.post("/test/bulk-leads", generateBulkLeads);

//Fetch seed data
router.post("/test/seed", seedDatabase);

export default router;