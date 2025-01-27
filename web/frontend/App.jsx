import { BrowserRouter, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";

import "@shopify/polaris/build/esm/styles.css";
import { QueryProvider, PolarisProvider } from "./components";
import { createContext, useEffect, useState, useRef } from "react";
import Setting from "./pages/Setting.jsx";
import { Toaster } from "react-hot-toast";
import Subscription from "./pages/Subscription.jsx";
import Loading from "./pages/Loading.jsx";
import Analytics from "./pages/Analytics.jsx";

export const StoreContext = createContext();

export default function App() {
  const [payment, setPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Set isLoading to true initially
  const [hightier, setHightier] = useState(false);

  // Using useRef to persist store data between renders
  const storeDataRef = useRef(null);

  // Function to get store info
  const StoreInfo = async () => {
    const res = await fetch("/api/store/info", { method: "GET" });
    const data = await res.json();
    storeDataRef.current = data; // Store data in the ref
    console.log("StoreData", data);
  };

  // Function to fetch subscription details
  const fetchSubscription = async (storeId) => {
    setIsLoading(true); // Set loading to true before fetching
    try {
      const response = await fetch(`/api/getdata?store_id=${storeId}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Subscription details:", data);
      if (data.status == "active") {
        setPayment(true);
      }
    } catch (error) {
      console.error("Error fetching subscription details:", error);
    } finally {
      setIsLoading(false); // Set loading to false after fetching
    }
  };

  const CheckChargeId = async (storeId) => {
    const URLOBJ = new URL(window.location.href);
    const chargeID = URLOBJ.searchParams.get("charge_id");

    if (chargeID) {
      try {
        setIsLoading(true)
        const response = await fetch(
          `/api/update-subscription?charge_id=${chargeID}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              storeId: storeId,
            }),
          }
        );

        const data = await response.json();
        console.log("charge Id ", data);
        
      } catch (err) {
        console.log(err);
      }finally{
        setIsLoading(false)
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch store info
        await StoreInfo();

        // Fetch subscription details once store data is available
        if (storeDataRef.current?.Store_Id) {
          await CheckChargeId(storeDataRef.current.Store_Id);
          await fetchSubscription(storeDataRef.current.Store_Id);
        }
      } catch (error) {
        console.error("Error during data fetching:", error);
      }
    };

    // Only run fetchData once on mount
    fetchData();
  }, [payment]); // Empty dependency array ensures the effect runs only once

  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });

  const { t } = useTranslation();

  // Render nothing until isLoading is false
  if (isLoading) {
    return (
      <PolarisProvider>
        <QueryProvider>
          <Loading />
        </QueryProvider>
      </PolarisProvider>
    );
  }

  // Render Subscription if payment is false and loading is complete
  if (!payment) {
    return (
      <PolarisProvider>
        <StoreContext.Provider value={storeDataRef.current}>
          <QueryProvider>
            <Subscription />
          </QueryProvider>
        </StoreContext.Provider>
      </PolarisProvider>
    );
  }

  // Render the main app if payment is true and loading is complete
  return (
    <PolarisProvider>
      <StoreContext.Provider value={storeDataRef.current}>
        <BrowserRouter>
          <Toaster />
          <QueryProvider>
            <NavMenu>
              <Link to="/" rel="home" />
              <Link to="/setting" element={<Setting />}>
                Setting
              </Link>

              <Link to="/analytics" element={<Analytics />}>Analytics</Link>
            </NavMenu>
            <Routes pages={pages} />
          </QueryProvider>
        </BrowserRouter>
      </StoreContext.Provider>
    </PolarisProvider>
  );
}