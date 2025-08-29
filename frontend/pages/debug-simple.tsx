import { useState } from "react";

const CRUDDebug = () => {
  const [results, setResults] = useState([]);

  const addResult = (message) => {
    setResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const testEnvironment = () => {
    addResult(`API URL: ${process.env.NEXT_PUBLIC_API_URL || "UNDEFINED"}`);
    addResult(`Node ENV: ${process.env.NODE_ENV || "UNDEFINED"}`);
  };

  const testFetch = async () => {
    try {
      const response = await fetch("/api/test");
      addResult(`Fetch test: ${response.status}`);
    } catch (error) {
      addResult(`Fetch error: ${error.message}`);
    }
  };

  const testBackendDirect = async () => {
    try {
      const response = await fetch("http://localhost:8000/health");
      const data = await response.json();
      addResult(`Backend direct: ${response.status} - ${data.status}`);
    } catch (error) {
      addResult(`Backend error: ${error.message}`);
    }
  };

  const testLogin = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "admin@example.com",
          password: "password123",
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        const token = data.data.token;
        localStorage.setItem("testToken", token);
        addResult(`Login successful: Token saved`);

        // Test campaigns with token
        const campaignsResponse = await fetch(
          "http://localhost:8000/api/campaigns",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const campaignsData = await campaignsResponse.json();
        addResult(
          `Campaigns fetch: ${campaignsResponse.status} - ${
            campaignsData.success
              ? campaignsData.data.length + " campaigns"
              : campaignsData.message
          }`
        );
      } else {
        addResult(`Login failed: ${data.message}`);
      }
    } catch (error) {
      addResult(`Login error: ${error.message}`);
    }
  };

  const clearResults = () => setResults([]);

  return (
    <div style={{ padding: "20px", maxWidth: "800px" }}>
      <h1>CRUD Operations Debug</h1>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={testEnvironment} style={{ marginRight: "10px" }}>
          Test Environment
        </button>
        <button onClick={testBackendDirect} style={{ marginRight: "10px" }}>
          Test Backend
        </button>
        <button onClick={testLogin} style={{ marginRight: "10px" }}>
          Test Full Login Flow
        </button>
        <button onClick={clearResults}>Clear Results</button>
      </div>

      <div
        style={{
          backgroundColor: "#f5f5f5",
          padding: "15px",
          borderRadius: "5px",
          fontFamily: "monospace",
          fontSize: "12px",
          maxHeight: "400px",
          overflowY: "scroll",
        }}
      >
        <h3>Debug Results:</h3>
        {results.length === 0 ? (
          <p>Click a test button to see results...</p>
        ) : (
          results.map((result, index) => (
            <div key={index} style={{ marginBottom: "5px" }}>
              {result}
            </div>
          ))
        )}
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#e8f5e8",
          borderRadius: "5px",
        }}
      >
        <h3>Expected Flow:</h3>
        <ol>
          <li>Environment variables should be set</li>
          <li>Backend should be reachable</li>
          <li>Login should work and return a token</li>
          <li>Campaigns should be fetchable with the token</li>
        </ol>
      </div>
    </div>
  );
};

export default CRUDDebug;
