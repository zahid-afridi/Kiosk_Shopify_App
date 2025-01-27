import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../App";
import toast from "react-hot-toast";
import ScreenSaverImage from "../assets/ss.jpg";

export default function Index() {
  const data = useContext(StoreContext);
  console.log("storedatafrom home", data);

  const [urlToCopy, setUrlToCopy] = useState("");
  let timer;

  const navigate = useNavigate();
  const location = useLocation();
  const [time, setTime] = useState(null);
  const [btn, setBtn] = useState(1);

  useEffect(() => {
    if (data) {
      const generatedUrl = `https://${data.domain}/?referenceKey=${data.Store_Id}`;
      setUrlToCopy(generatedUrl);
    }
  }, [data]);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const timeParam = query.get("time");
    if (timeParam) {
      const seconds = parseInt(timeParam);
      if (seconds > 0) {
        setTime(seconds);
        setBtn(3); // Update btn state to show the "Copy URL" section
        // Start the timer
        setTimeout(() => {
          alert(`Your ${seconds}-second timer has finished!`);
        }, seconds * 1000);
      }
    }
  }, [location]);

  const handleEnableExtension = () => {
    setBtn(2);
    // navigate("/setting");
  };

  const CopytoClipboard = () => {
    navigator.clipboard.writeText(urlToCopy).then(() => {
      toast.success("Copied to clipboard");
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-lg w-full text-center">
        {btn === 1 && (
          <>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome!</h1>
            <p className="text-gray-600 mb-6">
              Start managing your store effortlessly. Enable the extension to
              unlock powerful tools.
            </p>
            <button
              onClick={handleEnableExtension}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md text-sm font-semibold transition duration-200"
            >
              Continue
            </button>
          </>
        )}

        {btn === 2 && (
          <>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Your URL is Ready
            </h1>
            <p className="text-gray-600 mb-6">
              Here is your unique URL for managing traffic. You can use it for
              checkout or to track your traffic.
            </p>
            <p className="text-gray-700 mb-4">
              Your Unique URL: <strong>{urlToCopy}</strong>
            </p>
            <button
              onClick={CopytoClipboard}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 mx-4 rounded-lg shadow-md text-sm font-semibold transition duration-200 mb-6"
            >
              Copy URL
            </button>
          </>
        )}
      </div>
    </div>
  );
}
