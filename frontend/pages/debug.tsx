import { useEffect, useState } from "react";

const DebugPage = () => {
  const [envInfo, setEnvInfo] = useState({
    apiUrl: "",
    nodeEnv: "",
  });

  useEffect(() => {
    setEnvInfo({
      apiUrl: process.env.NEXT_PUBLIC_API_URL || "NOT SET",
      nodeEnv: process.env.NODE_ENV || "NOT SET",
    });
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Environment Debug</h1>
      <div>
        <h2>Environment Variables:</h2>
        <p>
          <strong>NEXT_PUBLIC_API_URL:</strong> {envInfo.apiUrl}
        </p>
        <p>
          <strong>NODE_ENV:</strong> {envInfo.nodeEnv}
        </p>
      </div>

      <div>
        <h2>Test API Call:</h2>
        <button
          onClick={async () => {
            try {
              const response = await fetch(`${envInfo.apiUrl}/campaigns`);
              console.log("API Response status:", response.status);
              alert(`API call result: ${response.status}`);
            } catch (error) {
              console.error("API Error:", error);
              alert(`API call failed: ${error.message}`);
            }
          }}
        >
          Test API Call
        </button>
      </div>
    </div>
  );
};

export default DebugPage;
