import React from "react";
import { useQuery } from "react-query";
import axios from "axios";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import { BarChart3, TrendingUp, Users, Target } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

interface PieChartData {
  name: string;
  value: number;
  fill: string;
}

interface SourceData {
  source: string;
  leads: number;
  converted: number;
  conversionRate: string;
}

const Analytics: React.FC = () => {
  const { data: leadStats, isLoading: leadStatsLoading } = useQuery(
    "leads-analytics",
    async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/leads/stats/overview`
      );
      return response.data.data;
    }
  );

  const { data: campaigns, isLoading: campaignsLoading } = useQuery(
    "campaigns-analytics",
    async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/campaigns`
      );
      return response.data.data;
    }
  );

  const isLoading = leadStatsLoading || campaignsLoading;

  // Prepare chart data
  const leadsByStatusData: PieChartData[] = React.useMemo(() => {
    if (!leadStats?.by_status) return [];

    return leadStats.by_status.map((item: any, index: number) => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: item.count,
      fill: COLORS[index % COLORS.length],
    }));
  }, [leadStats]);

  const leadsBySourceData: SourceData[] = React.useMemo(() => {
    if (!leadStats?.by_source) return [];

    return leadStats.by_source.map((item: any) => ({
      source: item.source.charAt(0).toUpperCase() + item.source.slice(1),
      leads: item.count,
      converted: item.won_count,
      conversionRate:
        item.count > 0 ? ((item.won_count / item.count) * 100).toFixed(1) : "0",
    }));
  }, [leadStats]);

  const campaignPerformanceData = React.useMemo(() => {
    if (!campaigns) return [];

    return campaigns.slice(0, 10).map((campaign: any) => ({
      name:
        campaign.name.length > 15
          ? campaign.name.substring(0, 15) + "..."
          : campaign.name,
      leads: parseInt(campaign.lead_count) || 0,
      budget: campaign.budget || 0,
    }));
  }, [campaigns]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card">
                  <div className="card-body h-80 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">
              Insights into your campaigns and leads performance
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-primary-600 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">
                      Total Leads
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {leadStats?.overview?.total_leads || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-success-600 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">
                      Conversion Rate
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {leadStats?.overview?.conversion_rate?.toFixed(1) || "0"}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-warning-600 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">
                      Active Campaigns
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {campaigns?.filter((c: any) => c.status === "active")
                        ?.length || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-danger-600 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">
                      Avg. Deal Size
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {leadStats?.overview?.avg_lead_value
                        ? `₹${leadStats.overview.avg_lead_value.toLocaleString(
                            "en-IN"
                          )}`
                        : "₹0"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leads by Status */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  Lead Status Distribution
                </h3>
              </div>
              <div className="card-body">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadsByStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {leadsByStatusData.map(
                          (entry: PieChartData, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          )
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Leads by Source */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  Lead Sources Performance
                </h3>
              </div>
              <div className="card-body">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leadsBySourceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="source"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="leads" fill="#3B82F6" name="Total Leads" />
                      <Bar
                        dataKey="converted"
                        fill="#10B981"
                        name="Converted"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Campaign Performance */}
            <div className="card lg:col-span-2">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  Campaign Performance
                </h3>
              </div>
              <div className="card-body">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={campaignPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Bar
                        yAxisId="left"
                        dataKey="leads"
                        fill="#3B82F6"
                        name="Leads"
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="budget"
                        fill="#F59E0B"
                        name="Budget (₹)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Lead Source Conversion Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">
                Lead Source Conversion Details
              </h3>
            </div>
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Leads
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Converted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Conversion Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leadsBySourceData.map(
                      (item: SourceData, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                            {item.source}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.leads}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.converted}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className="bg-primary-600 h-2 rounded-full"
                                  style={{
                                    width: `${Math.min(
                                      parseFloat(item.conversionRate),
                                      100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                              {item.conversionRate}%
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Analytics;
