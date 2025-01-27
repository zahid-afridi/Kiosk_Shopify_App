import SettingModel from "../model/Setting.js";

export const addSetting = async (req, res) => {
  try {
    console.log("api startinggg");
    const {
      seconds,
      Store_Id,
      screensaverSeconds,
      storeName,
      redirectUrl,
      buttonText,
      buttonColor,
    } = req.body;
    console.log("API hit with data:", {
      seconds,
      Store_Id,
      screensaverSeconds,
      storeName,
      buttonText,
      buttonColor,
    });
    console.log("reaq.file", req.file);
    if (
      !seconds ||
      !Store_Id ||
      !screensaverSeconds ||
      !storeName
    ){
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // if (!req.file) {

    //   return res
    //     .status(400)
    //     .json({ success: false, message: "Image file is required" });
    // }

    // const baseUrl = `${req.protocol}://${req.get("host")}`;
    let videoUrl;
    if (req.file) {
      const baseUrl = `http://localhost:56044`;
      videoUrl = `${baseUrl}/assets/${req.file.filename}`;
    }

    // Check if the setting for the given Store_Id exists
    const findStore = await SettingModel.findOne({ Store_Id });
    const updatevideoUrl = videoUrl ? videoUrl : findStore.videoUrl;
    if (findStore) {
      await SettingModel.updateOne(
        { Store_Id },
        {
          $set: {
            seconds,
            screensaverSeconds,
            storeName,
            videoUrl: updatevideoUrl,
            redirectUrl,
            buttonText,
            buttonColor,
          },
        }
      );
      return res.status(200).json({ message: "Settings updated successfully" });
    }

    const newSetting = new SettingModel({
      seconds,
      Store_Id,
      screensaverSeconds,
      storeName,
      videoUrl: updatevideoUrl,
      redirectUrl,
      buttonText,
      buttonColor,
    });
    console.log("api endinggg");
    await newSetting.save();
    return res.status(200).json({
      success: true,
      message: "Setting added successfully",
      setting: newSetting,
    });
  } catch (error) {
    console.log("Setting API error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const GetSetting = async (req, res) => {
  try {
    const { Store_Id } = req.query;
    if (!Store_Id) {
      return res.status(400).json({ error: "Store_Id is required" });
    }

    const setting = await SettingModel.findOne({ Store_Id });
    if (!setting) {
      return res.status(404).json({ error: "Setting not found" });
    }

    return res.status(200).json(setting);
  } catch (error) {
    console.log("Setting API error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const addsettingstandard = async (req, res) => {
  try {
    console.log("api startinggg");
    const {
      seconds,
      Store_Id,
      screensaverSeconds = null,
      storeName,
      redirectUrl = null,
      buttonText,
      buttonColor,
    } = req.body;
    console.log("API hit with data:", {
      seconds,
      Store_Id,
      screensaverSeconds,
      storeName,
    });

    const findStore = await SettingModel.findOne({ Store_Id });
    if (findStore) {
      await SettingModel.updateOne(
        { Store_Id },
        {
          $set: {
            seconds,
            screensaverSeconds,
            storeName,
            redirectUrl,
            buttonText,
            buttonColor,
          },
        }
      );
      return res.status(200).json({ message: "Settings updated successfully" });
    }

    if (!seconds || !Store_Id || !storeName) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const newSetting = new SettingModel({
      seconds,
      Store_Id,
      screensaverSeconds,
      storeName,
      redirectUrl,
      buttonText,
      buttonColor,
    });
    console.log("api endinggg");
    await newSetting.save();
    return res.status(200).json({
      success: true,
      message: "Setting added successfully",
      setting: newSetting,
    });
  } catch (error) {
    console.log("Setting API error:", error);
    return res.status(500).json({ error: error.message });
  }
};