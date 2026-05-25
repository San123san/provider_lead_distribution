import { Lead } from "../models/lead.model.js";
import { Provider } from "../models/provider.model.js";
import { WebhookLog } from "../models/webhookLog.model.js";

// FEATURE 1: SEED DATABASE (Reset everything)
export const seedDatabase = async (req, res) => {
  try {
    // Providers  data
    const providersData = [
      { providerId: 1, name: "Provider 1", mandatoryFor: ["Service 1", "Service 3"], poolFor: [] },
      { providerId: 2, name: "Provider 2", mandatoryFor: [], poolFor: ["Service 1", "Service 3"] },
      { providerId: 3, name: "Provider 3", mandatoryFor: [], poolFor: ["Service 1", "Service 3"] },
      { providerId: 4, name: "Provider 4", mandatoryFor: ["Service 3"], poolFor: ["Service 1"] },
      { providerId: 5, name: "Provider 5", mandatoryFor: ["Service 2"], poolFor: ["Service 3"] },
      { providerId: 6, name: "Provider 6", mandatoryFor: [], poolFor: ["Service 2", "Service 3"] },
      { providerId: 7, name: "Provider 7", mandatoryFor: [], poolFor: ["Service 2", "Service 3"] },
      { providerId: 8, name: "Provider 8", mandatoryFor: [], poolFor: ["Service 2", "Service 3"] },
    ];

    // 1. Delete old data so duplicate error not come
    await Provider.deleteMany({});
    await Lead.deleteMany({}); 
    await WebhookLog.deleteMany({});

    // 2. Insert new 8 provider (Default quota = 10)
    await Provider.insertMany(providersData);

    // 3. Send signal to frontend (Socket.io)
    const io = req.app.get("io");
    if (io) {
      io.emit("dashboardUpdate");
    }

    return res.status(200).json({ 
      success: true, 
      message: "✅ Database Seeded! All old data cleared and 8 fresh providers added." 
    });
  } catch (error) {
    console.error("Seed error:", error);
    return res.status(500).json({ success: false, message: "Internal server error during seeding" });
  }
};

// FEATURE 2: CONCURRENCY TEST (10 Leads at once)
export const generateBulkLeads = async (req, res) => {
  try {
    const services = ["Service 1", "Service 2", "Service 3"];
    const promises = [];

    //Create 10 different parallel lead processing tasks
    for (let i = 1; i <= 10; i++) {
      
      //For all lead have unique number to bypass duplicate check
      // But service is random for stress test on quota
      const service = services[Math.floor(Math.random() * services.length)];
      const phone = `99999000${i.toString().padStart(2, "0")}`;
      const name = `Test User ${i}`;

      //For check quota and allocation
      const task = (async () => {
        // 1. Find Mandatory Providers (Quota > 0)
        const mandatoryProviders = await Provider.find({ mandatoryFor: service, quota: { $gt: 0 } });
        let chosen = [];
        
        for (const p of mandatoryProviders) {
          if (chosen.length < 3) chosen.push(p);
        }

        // 2. Find Pool Providers (Round-Robin sorting based on lastAssignedAt)
        if (chosen.length < 3) {
          const chosenIds = chosen.map(p => p._id);
          const poolProviders = await Provider.find({
            poolFor: service,
            _id: { $nin: chosenIds },
            quota: { $gt: 0 }
          }).sort({ lastAssignedAt: 1 }); // SORTING: Oldest waiting gets priority

          const slotsNeeded = 3 - chosen.length;
          for (let j = 0; j < slotsNeeded && j < poolProviders.length; j++) {
            chosen.push(poolProviders[j]);
          }
        }

        //If didnt find 3 providers
        if (chosen.length !== 3) {
          return { success: false, message: `Lead ${i} failed: Not enough providers left.` };
        }

        //3. Atomic Update: Seleted provides quota safely -1
        const chosenIds = chosen.map(p => p._id);
        await Provider.updateMany(
          { _id: { $in: chosenIds } },
          { $inc: { quota: -1 }, $set: { lastAssignedAt: new Date() } }
        );

        //4. Save Lead Data
        const createdLead = await Lead.create({
          name,
          phone,
          city: "Test City",
          service,
          description: "Automated instant concurrency stress test lead.",
          assignedProviders: chosenIds
        });

        return { success: true, leadId: createdLead._id, service, assignedTo: chosen.map(p => p.name) };
      })();

      promises.push(task);
    }

    //Task have to paralled execute(Real Concurrency)
    const results = await Promise.all(promises);

    //Dashboard refresh karwa do Refresh the dashboard, when 10 leads complete
    const io = req.app.get("io");
    if (io) {
      io.emit("dashboardUpdate");
    }

    return res.status(200).json({
      success: true,
      message: "Bulk concurrent lead generation complete.",
      results
    });
  } catch (error) {
    console.error("Bulk generation failed:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};