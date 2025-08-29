import React, { useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const DebugAPI: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const testCampaignsAPI = async () => {
    try {
      addResult("🔍 Testing campaigns API...");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/campaigns`
      );
      addResult(
        `✅ Campaigns API success: ${JSON.stringify(
          {
            success: response.data.success,
            dataType: typeof response.data.data,
            dataLength: Array.isArray(response.data.data)
              ? response.data.data.length
              : "Not array",
            structure: response.data.data
              ? Object.keys(response.data.data[0] || {})
              : "No data",
          },
          null,
          2
        )}`
      );
    } catch (error: any) {
      addResult(`❌ Campaigns API error: ${error.message}`);
      if (error.response) {
        addResult(`❌ Response status: ${error.response.status}`);
        addResult(`❌ Response data: ${JSON.stringify(error.response.data)}`);
      }
    }
  };

  const testLeadsStatsAPI = async () => {
    try {
      addResult("🔍 Testing leads stats API...");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/leads/stats/overview`
      );
      addResult(
        `✅ Leads Stats API success: ${JSON.stringify(
          {
            success: response.data.success,
            dataType: typeof response.data.data,
            hasOverview: !!response.data.data?.overview,
            overviewKeys: response.data.data?.overview
              ? Object.keys(response.data.data.overview)
              : "No overview",
            fullResponse: response.data,
          },
          null,
          2
        )}`
      );
    } catch (error: any) {
      addResult(`❌ Leads Stats API error: ${error.message}`);
      if (error.response) {
        addResult(`❌ Response status: ${error.response.status}`);
        addResult(`❌ Response data: ${JSON.stringify(error.response.data)}`);
      }
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            API Debug Console
          </h1>
          <p className="text-gray-600">
            Test API endpoints and inspect responses
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={testCampaignsAPI}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Test Campaigns API
          </button>
          <button
            onClick={testLeadsStatsAPI}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Test Leads Stats API
          </button>
          <button
            onClick={clearResults}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Clear Results
          </button>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              API Test Results
            </h3>
          </div>
          <div className="card-body">
            <div className="bg-gray-100 p-4 rounded-md">
              <pre className="text-sm whitespace-pre-wrap">
                {results.length > 0
                  ? results.join("\n\n")
                  : "No tests run yet. Click a button above to start testing."}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DebugAPI;
