import mongoose from "mongoose";

const SettingSchema = new mongoose.Schema(
  {
    seconds: {
      type: Number,
      default: 10,
      required: true,
    },
    screensaverSeconds: {
      type: Number,
      default: 10,
    },
    storeName: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      default: null,
    },
    buttonText: {
      type: String,
      required: true,
      default: "Checkout",
    },
    buttonColor: {
      type: String,
      required: true,
      default: "#000000",
    },
    Store_Id: {
      type: String,
      required: true,
    },
    redirectUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);
const SettingModel = mongoose.model("Setting", SettingSchema);

export default SettingModel;