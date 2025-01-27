import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  Payment_type: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  store_id: {
    type: String,
    required: true,
  },
  subscription_id: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  expiry_date: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    default: "pending",
  },
});

const SubscriptionModel = mongoose.model("Subscription", subscriptionSchema);

export default SubscriptionModel;
