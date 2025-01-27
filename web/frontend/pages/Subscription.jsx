import React, { useEffect, useState } from "react";
import { Page, Banner, Layout } from "@shopify/polaris";
import "./subscription.css";
import check from "../assets/check-mark.png";
import close from "../assets/delete.png";

export default function Subscription() {
  const [store, setStore] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("standard");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const StoreInfo = async () => {
    try {
      const res = await fetch("/api/store/info", { method: "GET" });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setStore(data);
    } catch (error) {
      setError("Failed to load store information");
      console.error("Error fetching store information:", error);
    }
  };

  useEffect(() => {
    StoreInfo();
  }, []);

  const handlePlanChange = async (plan) => {
    setSelectedPlan(plan);
    setIsLoading(true);
    setError(null);

    const selectedPlanData =
      plan === "standard"
        ? {
            id: "standard",
            title: "Starter Plan",
            name: store?.storeName || "Your Store Name",
            price: 10,
            description:
              "All essential features to kickstart your kiosk with confidence.",
            cta: "Choose Starter",
            store_id: store?.Store_Id || 3123232,
            color: "#FFFFFF",
            return_url: `https://${store.domain}/admin/apps/d84d0dd27de3724183d520c4bb2cf351`,
          }
        : {
            id: "Premium",
            title: "Pro Plan",
            name: store?.storeName || "Your Store Name",
            price: 20,
            description:
              "Advanced tools to create a more interactive customer journey.",
            cta: "Choose Pro Plan",
            store_id: store?.Store_Id || 3123232,
            color: "#FFFFFF",
            return_url: `https://${store.domain}/admin/apps/d84d0dd27de3724183d520c4bb2cf351`,
          };

    try {
      const response = await fetch("/api/paymentmonthly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedPlanData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      const confirmation_url = res.charge?.confirmation_url;
      if (confirmation_url) {
        window.open(confirmation_url, "_blank");
      } else {
        throw new Error("Confirmation URL is missing in the response.");
      }
    } catch (error) {
      setError(`Error during API call: ${error.message}`);
      console.error("Error during API call:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Page
      title="Choose Your Plan"
      subtitle="Select the plan that works best for you."
    >
      {isLoading && <Banner status="info">Processing...</Banner>}
      {error && <Banner status="critical">{error}</Banner>}
      <Layout>
        <Layout.Section>
          <div className="subscription-container">
            {/* Monthly Plan Card */}
            <div
              className="subscription-card"
              style={{ backgroundColor: "#FFFFFF" }}
            >
              <div className="monthly-plan-card">
                <h3>Starter Plan</h3>
                <div className="poloris-card-header">
                  <h1>
                    $10<span className="monthly">/month</span>
                  </h1>
                </div>
                <ul className="list-poloris">
                  <li>
                    <img
                      src={check}
                      width={"20px"}
                      height={"20px"}
                      alt="check"
                    />
                    Unlimited Devices/Screens
                  </li>
                  <li>
                    <img
                      src={check}
                      width={"20px"}
                      height={"20px"}
                      alt="check"
                    />
                    QR payment
                  </li>
                  <li>
                    <img
                      src={check}
                      width={"20px"}
                      height={"20px"}
                      alt="check"
                    />
                    Store dashboard
                  </li>
                  <li>
                    <img
                      src={check}
                      width={"20px"}
                      height={"20px"}
                      alt="check"
                    />
                    Real-time sync with Shopify
                  </li>
                  <li>
                    <img
                      src={close}
                      width={"20px"}
                      height={"20px"}
                      alt="close"
                    />
                    Screensaver w. external embed option
                  </li>
                </ul>
                <button
                  className={
                    selectedPlan === "standard"
                      ? "selected"
                      : "default-poloris-class"
                  }
                  onClick={() => handlePlanChange("standard")}
                >
                  Choose Starter
                </button>
              </div>
            </div>

            {/* Yearly Plan Card */}
            <div
              className="subscription-card"
              style={{ backgroundColor: "#FFFFFF" }}
            >
              <div className="monthly-plan-card">
                <h3>Pro Plan</h3>
                <div className="poloris-card-header">
                  <h1>
                    $20<span className="monthly">/month</span>
                  </h1>
                </div>
                <ul className="list-poloris">
                  <li>
                    <img
                      src={check}
                      width={"20px"}
                      height={"20px"}
                      alt="check"
                    />
                    Unlimited Devices/Screens
                  </li>
                  <li>
                    <img
                      src={check}
                      width={"20px"}
                      height={"20px"}
                      alt="check"
                    />
                    QR payment
                  </li>
                  <li>
                    <img
                      src={check}
                      width={"20px"}
                      height={"20px"}
                      alt="check"
                    />
                    Store dashboard
                  </li>
                  <li>
                    <img
                      src={check}
                      width={"20px"}
                      height={"20px"}
                      alt="check"
                    />
                    Real-time sync with Shopify
                  </li>
                  <li>
                    <img
                      src={check}
                      width={"20px"}
                      height={"20px"}
                      alt="check"
                    />
                    Screensaver w. external embed option
                  </li>
                </ul>
                <button
                  className={
                    selectedPlan === "Premium"
                      ? "selected"
                      : "default-poloris-class"
                  }
                  onClick={() => handlePlanChange("Premium")}
                >
                  Choose Pro Plan
                </button>
              </div>
            </div>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
