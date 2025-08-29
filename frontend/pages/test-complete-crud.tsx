import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "react-query";

const CRUDTestPage = () => {
  const { user, login, logout } = useAuth();
  const queryClient = useQueryClient();
  const [testResults, setTestResults] = useState([]);
  const [loginForm, setLoginForm] = useState({
    email: "admin@example.com",
    password: "password123",
  });

  const addResult = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults((prev) => [
      ...prev,
      { message: `${timestamp}: ${message}`, type },
    ]);
  };

  // Test: Check auth headers
  const testAuthHeaders = () => {
    const authHeader = axios.defaults.headers.common["Authorization"];
    if (authHeader) {
      addResult(
        `✅ Auth headers set: ${authHeader.substring(0, 20)}...`,
        "success"
      );
    } else {
      addResult("❌ No auth headers found in axios defaults", "error");
    }
  };

  // Test: Manual login
  const testLogin = async () => {
    try {
      const success = await login(loginForm.email, loginForm.password);
      if (success) {
        addResult("✅ Login successful", "success");
        testAuthHeaders();
      } else {
        addResult("❌ Login failed", "error");
      }
    } catch (error) {
      addResult(`❌ Login error: ${error.message}`, "error");
    }
  };

  // Test: React Query campaigns fetch
  const {
    data: campaigns,
    error: campaignsError,
    isLoading: campaignsLoading,
    refetch: refetchCampaigns,
  } = useQuery(
    "test-campaigns",
    async () => {
      addResult("🔄 Fetching campaigns via React Query...", "info");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/campaigns`
      );
      addResult(
        `✅ Campaigns fetched: ${response.data.data.length} items`,
        "success"
      );
      return response.data.data;
    },
    {
      enabled: !!user, // Only run when user is logged in
      onError: (error) => {
        addResult(
          `❌ React Query campaigns error: ${
            error.response?.data?.message || error.message
          }`,
          "error"
        );
      },
    }
  );

  // Test: Manual API call
  const testManualAPI = async () => {
    try {
      addResult("🔄 Making manual API call...", "info");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/campaigns`
      );
      addResult(
        `✅ Manual API successful: ${response.data.data.length} campaigns`,
        "success"
      );
    } catch (error) {
      addResult(
        `❌ Manual API failed: ${error.response?.status} - ${
          error.response?.data?.message || error.message
        }`,
        "error"
      );
    }
  };

  // Test: Create campaign
  const createMutation = useMutation(
    (data) => axios.post(`${process.env.NEXT_PUBLIC_API_URL}/campaigns`, data),
    {
      onSuccess: (response) => {
        addResult(`✅ Campaign created: ${response.data.data.name}`, "success");
        queryClient.invalidateQueries("test-campaigns");
      },
      onError: (error) => {
        addResult(
          `❌ Campaign creation failed: ${
            error.response?.data?.message || error.message
          }`,
          "error"
        );
      },
    }
  );

  const testCreateCampaign = () => {
    const campaignData = {
      name: `Test Campaign ${Date.now()}`,
      description: "Test campaign created from debug page",
      status: "draft",
      budget: 1000,
    };

    addResult("🔄 Creating test campaign...", "info");
    createMutation.mutate(campaignData);
  };

  // Test: Environment variables
  const testEnvironment = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      addResult(`✅ API URL: ${apiUrl}`, "success");
    } else {
      addResult("❌ NEXT_PUBLIC_API_URL not set", "error");
    }
  };

  const clearResults = () => setTestResults([]);

  useEffect(() => {
    testEnvironment();
    testAuthHeaders();
  }, [user]);

  return (
    <div style={{ padding: "20px", maxWidth: "1000px" }}>
      <h1>Complete CRUD Test Page</h1>

      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#f0f0f0",
          borderRadius: "5px",
        }}
      >
        <h3>
          User Status: {user ? `Logged in as ${user.email}` : "Not logged in"}
        </h3>
        {!user && (
          <div>
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm({ ...loginForm, email: e.target.value })
              }
              style={{ marginRight: "10px", padding: "5px" }}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
              style={{ marginRight: "10px", padding: "5px" }}
            />
            <button onClick={testLogin}>Login</button>
          </div>
        )}
        {user && (
          <button
            onClick={logout}
            style={{
              backgroundColor: "#ff4444",
              color: "white",
              padding: "5px 10px",
            }}
          >
            Logout
          </button>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={testEnvironment} style={{ marginRight: "10px" }}>
          Test Environment
        </button>
        <button onClick={testAuthHeaders} style={{ marginRight: "10px" }}>
          Check Auth Headers
        </button>
        <button onClick={testManualAPI} style={{ marginRight: "10px" }}>
          Manual API Test
        </button>
        <button
          onClick={() => refetchCampaigns()}
          style={{ marginRight: "10px" }}
        >
          React Query Refetch
        </button>
        <button onClick={testCreateCampaign} style={{ marginRight: "10px" }}>
          Test Create Campaign
        </button>
        <button onClick={clearResults}>Clear Results</button>
      </div>

      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ flex: 1 }}>
          <h3>Test Results:</h3>
          <div
            style={{
              backgroundColor: "#f5f5f5",
              padding: "10px",
              borderRadius: "5px",
              maxHeight: "300px",
              overflowY: "scroll",
              fontFamily: "monospace",
              fontSize: "12px",
            }}
          >
            {testResults.length === 0 ? (
              <p>No test results yet...</p>
            ) : (
              testResults.map((result, index) => (
                <div
                  key={index}
                  style={{
                    color:
                      result.type === "error"
                        ? "red"
                        : result.type === "success"
                        ? "green"
                        : "black",
                    marginBottom: "2px",
                  }}
                >
                  {result.message}
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h3>Campaigns Data:</h3>
          <div
            style={{
              backgroundColor: "#f0f8ff",
              padding: "10px",
              borderRadius: "5px",
              maxHeight: "300px",
              overflowY: "scroll",
            }}
          >
            {campaignsLoading && <p>Loading campaigns...</p>}
            {campaignsError && (
              <p style={{ color: "red" }}>Error: {campaignsError.message}</p>
            )}
            {campaigns && (
              <div>
                <p>
                  <strong>Found {campaigns.length} campaigns:</strong>
                </p>
                {campaigns.map((campaign, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "5px",
                      padding: "5px",
                      backgroundColor: "white",
                      borderRadius: "3px",
                    }}
                  >
                    <strong>{campaign.name}</strong> - {campaign.status}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRUDTestPage;
