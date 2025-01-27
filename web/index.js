// @ts-check
import path, { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import DbConnection from "./db/Db.js";
import StoreModel from "./model/Store.js";
import SettingRoutes from "./routes/Setting.js";
import SubscriptionRoutes from "./routes/subscription.js";
import cron from "node-cron";
import SubscriptionModel from "./model/subscription.js";
import SettingModel from "./model/Setting.js";
import { fileURLToPath } from "url";
import AnalyticsModel from "./model/Analytics.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// dbconnection here

DbConnection();
// Set up Shopify authentication and webhook handling

app.use(express.json());
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());
app.use("/customapi/*", authenticateUser);
async function authenticateUser(req, res, next) {
  let shop = req.query.shop;
  let storeName = await shopify.config.sessionStorage.findSessionsByShop(shop);
  // console.log("storename for view", storeName);
  if (shop === storeName[0].shop) {
    next();
  } else {
    res.send("user not authersiozed");
  }
}

const __filename = fileURLToPath(import.meta.url); // Get the file name from import.meta.url
const __dirname = path.dirname(__filename); // Get the directory name

const PublicPaath = path.join(__dirname, "public"); // Resolve the path to the public folder

app.use(express.static(PublicPaath));

app.use("/api", SubscriptionRoutes);
app.use("/api/settings", SettingRoutes);

// shopify store api
app.get("/api/store/info", async (req, res) => {
  try {
    const Store = await shopify.api.rest.Shop.all({
      session: res.locals.shopify.session,
    });
    // console.log("Storename",Store.data[0].domain)
    // console.log('Store Information',Store)
    if (Store && Store.data && Store.data.length > 0) {
      const storeName = Store.data[0].name;
      const domain = Store.data[0].domain;
      const country = Store.data[0].country;
      const Store_Id = Store.data[0].id;

      // Check if storeName exists in the database
      let existingStore = await StoreModel.findOne({ storeName });

      if (!existingStore) {
        // If it doesn't exist, save it
        const newStore = new StoreModel({
          storeName,
          domain,
          country,
          Store_Id,
        });
        await newStore.save();
        //  await BillingModel.create({
        //     store_id:Store_Id,
        //     aliexProductNumber:10,
        //     csvProductNumber:10
        //   })
        existingStore = newStore;
      }

      // Send response with existingStore only
      res.status(200).json(existingStore); // Send existingStore directly in the response
    } else {
      res.status(404).json({ message: "Store not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server Error" });
  }
});

// app.use(express.static(path.join(__dirname, 'public')));

// Cronjob for updating subscriptions
cron.schedule("0 */5 * * *", async () => {
  console.log("Running cron job...");
  try {
    const currentDate = new Date().toISOString();
    const expiredSubscriptions = await SubscriptionModel.find({
      expiry_date: { $lt: currentDate },
    });
    if (expiredSubscriptions) {
      for (let subscription of expiredSubscriptions) {
        subscription.subscription_id = null;
        await subscription.save();
        // console.log(
        //   `Updated subscription for store_id: ${subscription.store_id}`
        // );
      }
    }
    console.log("Cron job completed.");
  } catch (error) {
    console.error("Error in cron job:", error.message);
  }
});

app.get("/api/retrieve_order", async (req, res) => {
 
  try {
    const orders = await shopify.api.rest.Order.all({
      session: res.locals.shopify.session,

     
    });
    console.log("Retrieved orders:", orders);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server Error" });
  }
});

// extension cutom api
app.get("/customapi/settingapi", async (req, res) => {
  // const { Store_Id } = req.body;
  const storeName = req.query.storeName?.toString();
  // console.log("api hit successfull", typeof storeName);
  const findedStore = await SettingModel.findOne({ storeName });
  if (findedStore) {
    res.json(findedStore);
  } else {
    res.json("store not found");
  }
});

app.get("/api/products/count", async (_req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const countData = await client.request(`
    query shopifyProductCount {
      productsCount {
        count
      }
    }
  `);

  res.status(200).send({ count: countData.data.productsCount.count });
});

app.post("/api/products", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

////////////////ANALAYTIC API //////////////////////////////////////////////
app.get("/customapi/analytics", async (req, res) => {
  const domain = req.query.domain?.toString();
  console.log("domain", domain);
  if (!domain) {
    return res.status(400).json({ error: "Store name is required" });
  }
  try {
    const CreateAnalytic = await AnalyticsModel({
      domain,
    });
    await CreateAnalytic.save();

    res.status(200).json({ message: "Analytic Created Successfully" });
  } catch (error) {
    console.log("erro", error);
    res.status(500).json({ message: "internal server error" });
  }
});
////////////////ANALAYTIC API END//////////////////////////////////////////////
app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

app.listen(PORT, () => {
  console.log("app running on port", PORT);
});
