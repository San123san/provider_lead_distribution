import { Provider } from "../models/provider.model.js";
import { Lead } from "../models/lead.model.js";

export const getDashboardData = async (req, res) => {
  try {
    //1. Fetch all providers
    const providers = await Provider.find({});

    //Sort
    providers.sort((a, b) => a.providerId - b.providerId);

    //2. Fetch assigned leads of all provider
    const dashboardData = await Promise.all(
      providers.map(async (provider) => {
        // Find leads where this provider's ID is in the assignedProviders array
        const assignedLeads = await Lead.find({ assignedProviders: provider._id });
        
        // For latest lead in sort format
        assignedLeads.sort((a, b) => b.createdAt - a.createdAt);
        
        return {
          providerId: provider.providerId,
          name: provider.name,
          remainingQuota: provider.quota,
          leadsReceivedCount: assignedLeads.length,
          assignedLeads: assignedLeads 
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};