import { Lead } from "../models/lead.model.js";
import { Provider } from "../models/provider.model.js";

export const createLead = async (req, res) => {
  try {
    const { name, phone, city, service, description } = req.body;
    // This 2 Line Add for Detective  Work
    // console.log("📥 Form Data Received:", req.body);
    // const count = await Provider.countDocuments({});
    // console.log("📊 Total Providers in DB:", count);

    //1. make a array to hold 3 choosen provide in the form of array
    let chosenProviders = [];

    //2. Fetch Mandatory providers for service who have quota > 0
    const mandatoryProviders = await Provider.find({
      mandatoryFor: service,
      quota: { $gt: 0 }
    });

    //Add mandatroy providers to our chosen list (up to 3 max)
    for (const provider of mandatoryProviders) {
      if (chosenProviders.length < 3) {
        chosenProviders.push(provider);
      }
    }

    //3. Find remaining slot for check chosen provider is >3 or not
    const slotsRemaining = 3 - chosenProviders.length;
    
    if (slotsRemaining > 0) {
      //Get Ids of already chose mandatory
      const chosenIds = chosenProviders.map(p => p._id);

      //Fetch excluding(which is not in choseIds) Ids from pool
      const poolProviders = await Provider.find({
        poolFor: service,
        _id: { $nin: chosenIds },
        quota: { $gt: 0 }
      }).sort({ lastAssignedAt: 1 }); // Sorting in descending according to time(Round Robin)

      //Add pool provider to fullfill the remaining slots
      for (let i = 0; i < slotsRemaining && i < poolProviders.length; i++) {
        chosenProviders.push(poolProviders[i]);
      }
    }

    // Check if we successfully found or not 3 providers
    if (chosenProviders.length !== 3) {
      return res.status(400).json({
        success: false,
        message: "Not enough providers with available quota for this service."
      });
    }

    // 4. Concurrency Safe Update: Deduct Quota atomically for chosen providers
    const chosenProviderIds = chosenProviders.map(p => p._id);
    
    await Provider.updateMany(
      { _id: { $in: chosenProviderIds } },
      { 
        $inc: { quota: -1 }, // Decrease quota by 1 safely
        $set: { lastAssignedAt: new Date() } // Update timestamp for future round-robin
      }
    );

    // 5. Save the Lead in Database
    const newLead = await Lead.create({
      name,
      phone,
      city,
      service,
      description,
      assignedProviders: chosenProviderIds
    });

    // 6. Send signal to frontend to update Live Dashboard automatically
    const io = req.app.get("io");
    if (io) {
      io.emit("dashboardUpdate"); 
    }

    // 7. Send Success Response to Frontend
    return res.status(201).json({
      success: true,
      message: "Lead generated and assigned successfully!",
      lead: newLead,
      assignedTo: chosenProviders.map(p => p.name)
    });

  } catch (error) {
    // Check if error is MongoDB Duplicate Key Error (Code 11000)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate Lead: This phone number has already submitted an inquiry for this service."
      });
    }
    
    console.error("Error creating lead:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};