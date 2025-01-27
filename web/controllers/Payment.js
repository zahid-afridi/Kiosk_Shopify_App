import SubscriptionModel from "../model/subscription.js";
import shopify from "../shopify.js";

export const PaymentMonthly = async (req, res) => {
  try {
    const { name, price, return_url, store_id, title } = req.body;

    console.log("montly api hit successfully");
    const application_charge_recurring =
      await new shopify.api.rest.RecurringApplicationCharge({
        session: res.locals.shopify.session,
      });

    application_charge_recurring.name = name;
    application_charge_recurring.price = price;
    application_charge_recurring.store_id = store_id;
    application_charge_recurring.return_url = return_url;
    application_charge_recurring.test = true;

    await application_charge_recurring.save({
      update: true,
    });

    // Get current date and expiry date based on the payment type
    const currentDate = new Date();
    let expiryDate = new Date();
    expiryDate.setMonth(currentDate.getMonth() + 1);
    console.log("Expiry Date:", expiryDate);

    // saving ioon database
    const findpayment = await SubscriptionModel.findOne({
      store_id: store_id,
    });
    if (!findpayment) {
      try {
        const newpayment = new SubscriptionModel({
          store_id: store_id,
          Payment_type: title,
          price: price,
          subscription_id: application_charge_recurring.id,
          expiry_date: expiryDate.toISOString(),
        });
        await newpayment.save();
        console.log("Saved in db");
      } catch (err) {
        console.log(err);
      }
    } else {
      findpayment.subscription_id = application_charge_recurring.id;
      findpayment.expiry_date = expiryDate;
      await findpayment.save();
      console.log("Updated in DB");
    }

    // Send success response
    res.status(201).json({
      message: "Recurring application charge created successfully",
      charge: application_charge_recurring,
    });
  } catch (err) {
    console.error(
      "Error creating application charge:",
      err.response?.data || err.message
    );
    return res.status(500).json({
      error: "Failed to create application charge",
      details: err.message,
    });
  }
};

export const updateSubscriptionByChargeId = async (req, res) => {
  const { charge_id } = req.query;
  const { storeId } = req.body;

  if (!charge_id) {
    return res.status(400).json({ error: "charge_id is required" });
  }

  if (!res.locals.shopify.session) {
    return res.status(400).json({ error: "session is required" });
  }

  try {
    // Retrieve the recurring charge using the Shopify API
    const retrievePayment = await shopify.api.rest.RecurringApplicationCharge.find({
      session: res.locals.shopify.session,
      id: charge_id,
    });

    if (!retrievePayment) {
      return res.status(404).json({ error: "Recurring charge not found" });
    }

    // Update the subscription status in the database using storeId
    const subscription = await SubscriptionModel.findOneAndUpdate(
      { store_id: storeId }, // Query by storeId
      { status: retrievePayment.status }, // Update the status
      { new: true } // Return the updated document
    );

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    console.log("Retrieved Payment Status:", retrievePayment.status, "Subscription:", subscription);

    // Send a success response
    res.status(200).json({
      message: "Subscription updated successfully",
      retrievePayment,
      subscription,
    });
  } catch (error) {
    console.error("Error handling charge callback:", error.message);
    res.status(500).json({
      error: "Failed to process charge callback",
      details: error.message,
    });
  }
};  

export const getData = async (req, res) => {
  try {
    const { store_id } = req.query;

    if (!store_id) {
      return res.status(400).json({ message: "Store ID is required" });
    }

    const findpayment = await SubscriptionModel.findOne({ store_id });

    if (!findpayment) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    return res.status(200).json(findpayment);
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({ message: "Failed to fetch data" });
  }
};
