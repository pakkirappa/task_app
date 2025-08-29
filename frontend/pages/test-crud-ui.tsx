// Test React Query and Auth integration
import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import axios from "axios";

const TestPage = () => {
  const [authToken, setAuthToken] = useState("");
  const [manualTestResult, setManualTestResult] = useState("");

  // Test login
  const loginTest = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/login",
        {
          email: "admin@example.com",
          password: "password123",
        }
      );

      if (response.data.success) {
        const token = response.data.data.token;
        setAuthToken(token);

        // Set axios default header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setManualTestResult("✅ Login successful, token set");
      }
    } catch (error) {
      setManualTestResult(
        `❌ Login failed: ${error.response?.data?.message || error.message}`
      );
    }
  };

  // Test campaigns fetch with React Query
  const {
    data: campaigns,
    error,
    isLoading,
    refetch,
  } = useQuery(
    "test-campaigns",
    async () => {
      console.log(
        "Making API call with token:",
        authToken ? "PRESENT" : "MISSING"
      );
      const response = await axios.get("http://localhost:8000/api/campaigns");
      console.log("API Response:", response.data);
      return response.data.data;
    },
    {
      enabled: !!authToken, // Only run if token exists
      retry: false,
      onError: (err) => {
        console.error("React Query Error:", err);
      },
      onSuccess: (data) => {
        console.log("React Query Success:", data);
      },
    }
  );

  // Manual API test
  const manualApiTest = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/campaigns");
      setManualTestResult(
        `✅ Manual API call successful: ${response.data.data.length} campaigns`
      );
    } catch (error) {
      setManualTestResult(
        `❌ Manual API call failed: ${error.response?.status} - ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>CRUD Debug Test Page</h1>

      <div style={{ marginBottom: "20px" }}>
        <h2>Environment Check:</h2>
        <p>API URL: {process.env.NEXT_PUBLIC_API_URL || "NOT SET"}</p>
        <p>Auth Token: {authToken ? "SET" : "NOT SET"}</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2>Manual Tests:</h2>
        <button onClick={loginTest} style={{ marginRight: "10px" }}>
          1. Login Test
        </button>
        <button onClick={manualApiTest} style={{ marginRight: "10px" }}>
          2. Manual API Call
        </button>
        <button onClick={() => refetch()}>3. React Query Refetch</button>
        <p>Manual Test Result: {manualTestResult}</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2>React Query Test:</h2>
        {isLoading && <p>Loading campaigns...</p>}
        {error && (
          <p style={{ color: "red" }}>
            React Query Error: {error.response?.data?.message || error.message}
          </p>
        )}
        {campaigns && (
          <p style={{ color: "green" }}>
            React Query Success: Found {campaigns.length} campaigns
          </p>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2>Console Logs:</h2>
        <p>Check browser console for detailed logs</p>
      </div>
    </div>
  );
};

export default TestPage;
