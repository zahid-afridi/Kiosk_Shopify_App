import {
  PaymentMonthly,
  getData,
  updateSubscriptionByChargeId,
} from "../controllers/Payment.js";
import express from "express";
const SubscriptionRoutes = express.Router();
SubscriptionRoutes.post("/paymentmonthly", PaymentMonthly);
SubscriptionRoutes.post("/update-subscription", updateSubscriptionByChargeId);
SubscriptionRoutes.get("/getdata", getData);

export default SubscriptionRoutes;
