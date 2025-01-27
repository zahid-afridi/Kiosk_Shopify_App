import AnalyticsModel from "../model/Analytics.js";


export const getAnalytics = async (req, res) => {
  try {
    const domain = req.query.domain?.toString();
    if (!domain) {
      return res.status(400).json({ message: "Domain is required" });
    }
    const analytics = await AnalyticsModel.find({ domain: domain });
    res.status(200).json(analytics);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "internal server error" });
  }
};