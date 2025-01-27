import React, { useState, useEffect, useContext } from "react";
import { LegacyCard, Page, Layout, Text } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import "./Analytics.css"; // Import custom CSS
import { StoreContext } from "../App";

export default function Analytics() {
  const data = useContext(StoreContext);
  console.log("Store data from analytics:", data.domain);
  const [domain, setDomain] = useState(data.domain);
  const [finalQrCodeScans, setFinalQrCodeScans] = useState(0); // Initialize to 0
  const [finalSalesCount, setFinalSalesCount] = useState(0); // Initialize to 0

  // Fetch orders and update finalSalesCount
  const getOrder = async () => {
    try {
      const response = await fetch("/api/retrieve_order");
      const data = await response.json();
      const order = data.data;
          console.log('order',order)
      // Summing current_total_price of all array and setting it to finalSalesCount
      const sum = order.reduce((accumulator, currentValue) => {
        // Convert current_total_price to a number and add it to the accumulator
        return accumulator + parseFloat(currentValue.current_total_price);
      }, 0);

      setFinalSalesCount(sum); // Keep it as a number
      console.log("Retrieve order:", data.data);
    } catch (err) {
      console.log("Retrieving failed:", err);
    }
  };

  // Fetch QR code analytics
  const getQr = async () => {
    try {
      if (!domain) {
        throw new Error("Domain is not defined in the context.");
      }
      const response = await fetch(`/api/retrieve_analytics?domain=${domain}`);
      const data = await response.json();
    console.log('qarsca',data.length)
      if (Array.isArray(data)) {
        setFinalQrCodeScans(data.length);
      } else {
        console.error("Invalid response format:", data);
      }
    } catch (err) {
      console.error("Error fetching QR analytics:", err);
    }
  };

  useEffect(() => {
    getOrder();
    getQr();
  }, []);

  // State for animated values
  const [qrCodeScans, setQrCodeScans] = useState(0);
  const [salesCount, setSalesCount] = useState(0);

  // Animation duration in milliseconds
  const animationDuration = 1000; // 1 second
  const frameRate = 50; // Frames per second

  // Start animation after data is fetched
  useEffect(() => {
    if (finalSalesCount > 0 && finalQrCodeScans > 0) {
      const incrementQr = finalQrCodeScans / (animationDuration / (1000 / frameRate));
      const incrementSales = finalSalesCount / (animationDuration / (1000 / frameRate));

      let startTime = Date.now();

      const interval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;

        if (elapsedTime >= animationDuration) {
          setQrCodeScans(finalQrCodeScans);
          setSalesCount(finalSalesCount);
          clearInterval(interval);
        } else {
          setQrCodeScans((prev) =>
            Math.min(prev + incrementQr, finalQrCodeScans)
          );
          setSalesCount((prev) =>
            Math.min(prev + incrementSales, finalSalesCount)
          );
        }
      }, 1000 / frameRate);

      return () => clearInterval(interval);
    }
  }, [finalSalesCount, finalQrCodeScans]);

  return (
    <Page title="Analytics">
      <Layout>
        <Layout.Section oneHalf>
          <LegacyCard sectioned>
            <div className="metric-box">
              <Text variant="headingMd" as="h2" color="subdued">
                QR Code Scans
              </Text>
              <Text variant="headingXl" as="p" fontWeight="bold">
                {Math.floor(qrCodeScans)}
              </Text>
            </div>
          </LegacyCard>
        </Layout.Section>
        <Layout.Section oneHalf>
          <LegacyCard sectioned>
            <div className="metric-box">
              <Text variant="headingMd" as="h2" color="subdued">
                Sales Count
              </Text>
              <Text variant="headingXl" as="p" fontWeight="bold">
                ${salesCount.toFixed(2)} {/* Format here */}
              </Text>
            </div>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}