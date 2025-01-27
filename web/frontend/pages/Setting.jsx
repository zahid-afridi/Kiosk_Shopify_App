import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../App";
import toast from "react-hot-toast";

export default function Setting() {
  const data = useContext(StoreContext);
  const navigate = useNavigate();

  const [time, setTime] = useState("");
  const [screensavertime, setScreensavertime] = useState("");
  const [Buttontext, setButtontext] = useState("");
  const [buttonColor, setButtonColor] = useState("");
  const [selectedFile, setSelectedFile] = useState(null); // State for file
  const [url, setUrl] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state for form submission

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const req = await fetch(
          `/api/settings/getsetting?Store_Id=${data.Store_Id}`,
          { method: "GET" }
        );
        const resp = await req.json();
        setScreensavertime(resp.screensaverSeconds);
        setTime(resp.seconds);
        setUrl(resp.redirectUrl);
        setButtonColor(resp.buttonColor);
        setButtontext(resp.buttonText);
      } catch (error) {
        toast.error("Failed to fetch settings.");
      }
    };

    fetchSettings();
    fetchSubscription(data.Store_Id);
  }, [data.Store_Id]);

  const handleSave = async () => {
    if (!time || isNaN(time) || time <= 0) {
      toast.error("Please enter a valid time for QR code.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("seconds", time);
      formData.append("screensaverSeconds", screensavertime);
      formData.append("redirectUrl", url);
      formData.append("buttonText", Buttontext);
      formData.append("buttonColor", buttonColor);
      formData.append("Store_Id", data.Store_Id);
      formData.append("storeName", data.domain);
      formData.append("videoUrl", selectedFile); // Append new file

      // Check the FormData before sending
      console.log("FormData being sent: ");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const req = await fetch("/api/settings/addsetting", {
        method: "POST",
        body: formData,
      });

      const response = await req.json();
      console.log("Response from server: ", response);

      if (response.success) {
        toast.success(response.message);
        setScreensavertime("");
        setTime("");
        setSelectedFile(null);
        setUrl("");
      } else {
        toast.success(response.message || "Error saving settings");
      }
    } catch (error) {
      toast.error("An error occurred while saving settings.");
      console.log("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubscription = async (storeId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/getdata?store_id=${storeId}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Subscription details:", data);

      if (data.Payment_type == "Pro Plan") {
        setIsPro(true);
        console.log(isPro);
      }
    } catch (error) {
      console.error("Error fetching subscription details:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSaveStandard = async () => {
    if (!time || isNaN(time) || time <= 0) {
      toast.error("Please enter a valid time for QR code.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/settings/addsettingstandard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seconds: time,
          Store_Id: data.Store_Id,
          storeName: data.domain,
          buttonText : Buttontext,
          buttonColor : buttonColor
        }),
      });

      const responsedata = await response.json();
      console.log("Response from server: ", responsedata);

      if (responsedata.success) {
        toast.success(responsedata.message);
      }
    } catch (error) {
      toast.error("An error occurred while saving settings.");
      console.log("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-lg w-full text-center">
        {isPro ? (
          <>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Set Timer</h1>
            <p className="text-gray-600 mb-6">
              Enter the time in seconds for the screensaver and QR code.
            </p>

            <div className="mb-6">
              <label
                htmlFor="qrCodeTime"
                className="block text-left text-gray-800 mb-2 font-medium"
              >
                Time for QR Code
              </label>
              <input
                id="qrCodeTime"
                type="number"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Enter time for QR Code"
                className="border border-gray-300 rounded-lg px-4 py-2 w-full"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="screensaverTime"
                className="block text-left text-gray-800 mb-2 font-medium"
              >
                Time for Screen Saver
              </label>
              <input
                id="screensaverTime"
                type="number"
                value={screensavertime}
                onChange={(e) => setScreensavertime(e.target.value)}
                placeholder="Enter time for Screen Saver"
                className="border border-gray-300 rounded-lg px-4 py-2 w-full"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="buttonText"
                className="block text-left text-gray-800 mb-2 font-medium"
              >
                Text for Buttons
              </label>
              <input
                id="buttonText"
                type="text"
                value={Buttontext}
                onChange={(e) => setButtontext(e.target.value)}
                placeholder="Enter text for buttons"
                className="border border-gray-300 rounded-lg px-4 py-2 w-full"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="buttonColor"
                className="block text-left text-gray-800 mb-2 font-medium"
              >
                Set Color for Buttons
              </label>
              <input
                id="buttonColor"
                type="color"
                value={buttonColor}
                onChange={(e) => setButtonColor(e.target.value)}
                placeholder="Enter color for buttons"
                className="border border-gray-300 rounded-lg px-4 py-2 w-full"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="redirectUrl"
                className="block text-left text-gray-800 mb-2 font-medium"
              >
                URL
              </label>
              <input
                id="redirectUrl"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter perfect URL for redirecting from Screensaver"
                className="border border-gray-300 rounded-lg px-4 py-2 w-full"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="fileInput"
                className="block text-left text-gray-800 mb-2 font-medium"
              >
                Select a file to upload for screensaver
              </label>
              <input
                id="fileInput"
                type="file"
                onChange={(e) => {
                  setSelectedFile(e.target.files[0]);
                }}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={isLoading}
              className={`${
                isLoading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
              } text-white px-6 py-3 rounded-lg shadow-md text-sm font-semibold transition duration-200`}
            >
              {isLoading ? "Saving..." : "Save and Enable"}
            </button>
          </>
        ) : (
          <>
            <div className="mb-6">
              <label
                htmlFor="qrCodeTime"
                className="block text-left text-gray-800 mb-2 font-medium"
              >
                Time for QR Code
              </label>
              <input
                id="qrCodeTime"
                type="number"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Enter time for QR Code"
                className="border border-gray-300 rounded-lg px-4 py-2 w-full"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="buttonText"
                className="block text-left text-gray-800 mb-2 font-medium"
              >
                Text for Buttons
              </label>
              <input
                id="buttonText"
                type="text"
                value={Buttontext}
                onChange={(e) => setButtontext(e.target.value)}
                placeholder="Enter text for buttons"
                className="border border-gray-300 rounded-lg px-4 py-2 w-full"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="buttonColor"
                className="block text-left text-gray-800 mb-2 font-medium"
              >
                Set Color for Buttons
              </label>
              <input
                id="buttonColor"
                type="color"
                value={buttonColor}
                onChange={(e) => setButtonColor(e.target.value)}
                placeholder="Enter color for buttons"
                className="border border-gray-300 rounded-lg px-4 py-2 w-full"
              />
            </div>

            <button
              onClick={handleSaveStandard}
              disabled={isLoading}
              className={`${
                isLoading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
              } text-white px-6 py-3 rounded-lg shadow-md text-sm font-semibold transition duration-200`}
            >
              {isLoading ? "Saving..." : "Save and Enable"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}