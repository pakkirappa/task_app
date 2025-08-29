import React from "react";
import { useQuery } from "react-query";
import axios from "axios";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import {
  Users,
  Target,
  TrendingUp,
  DollarSign,
  BarChart3,
  IndianRupee,
} from "lucide-react";
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
} from "recharts";

interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  //   totalLeads: number;
  convertedLeads: number;
  totalRevenue: number;
  avgDealSize: number;
}

interface LeadsByStatus {
  status: string;
  count: number;
  total_value: string;
}

interface LeadsBySource {
  source: string;
  count: number;
  won_count: number;
  won_value: string;
}

interface ChartData {
  name: string;
  value: number;
  fill: string;
}

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

const Dashboard: React.FC = () => {
  // Fetch dashboard stats
  const {
    data: campaignStats,
    isLoading: campaignLoading,
    error: campaignError,
  } = useQuery("campaigns-stats", async () => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/campaigns`
    );
    return response.data.data;
  });

  const {
    data: leadStats,
    isLoading: leadStatsLoading,
    error: leadStatsError,
  } = useQuery("leads-stats", async () => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/leads/stats/overview`
    );
    return response.data.data;
  });

  // Debug logging
  React.useEffect(() => {
    if (campaignError) {
      console.error("Campaign stats error:", campaignError);
    }
    if (leadStatsError) {
      console.error("Lead stats error:", leadStatsError);
    }
    if (leadStats) {
      console.log("Lead stats data:", leadStats);
    }
  }, [campaignError, leadStatsError, leadStats]);

  // Calculate dashboard metrics
  const dashboardStats: DashboardStats = React.useMemo(() => {
    if (!campaignStats || !leadStats || !leadStats.overview)
      return {
        totalCampaigns: 0,
        activeCampaigns: 0,
        convertedLeads: 0,
        totalRevenue: 0,
        avgDealSize: 0,
      };

    const activeCampaigns = campaignStats.filter(
      (c: any) => c.status === "active"
    ).length;

    return {
      totalCampaigns: campaignStats.length,
      activeCampaigns,
      convertedLeads: leadStats.overview.won_leads || 0,
      totalRevenue: leadStats.overview.total_won_value || 0,
      avgDealSize: leadStats.overview.avg_lead_value || 0,
    };
  }, [campaignStats, leadStats]);

  const leadsByStatusData: ChartData[] = React.useMemo(() => {
    if (!leadStats?.by_status) return [];

    return leadStats.by_status.map((item: LeadsByStatus, index: number) => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: item.count,
      fill: COLORS[index % COLORS.length],
    }));
  }, [leadStats]);

  const leadsBySourceData = React.useMemo(() => {
    if (!leadStats?.by_source) return [];

    return leadStats.by_source.map((item: LeadsBySource) => ({
      source: item.source.charAt(0).toUpperCase() + item.source.slice(1),
      leads: item.count,
      converted: item.won_count,
      conversionRate:
        item.count > 0 ? ((item.won_count / item.count) * 100).toFixed(1) : "0",
    }));
  }, [leadStats]);

  const isLoading = campaignLoading || leadStatsLoading;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card">
                  <div className="card-body">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </div>
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
          {/* Page header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back! Here&apos;s an overview of your campaigns and leads.
            </p>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Target className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Campaigns
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {dashboardStats.totalCampaigns}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-success-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Campaigns
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {dashboardStats.activeCampaigns}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-warning-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Leads
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {dashboardStats.totalLeads}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div> */}

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <IndianRupee className="h-8 w-8 text-danger-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Revenue
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ₹{dashboardStats.totalRevenue.toLocaleString("en-IN")}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leads by Status */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  Leads by Status
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
                          (entry: ChartData, index: number) => (
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
                  Leads by Source
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
          </div>

          {/* Recent activity or additional metrics */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Key Metrics</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {dashboardStats.convertedLeads}
                  </div>
                  <div className="text-sm text-gray-500">Converted Leads</div>
                </div>
                <div className="text-center">
                  {/* <div className="text-2xl font-bold text-success-600">
                    {dashboardStats.totalLeads > 0
                      ? (
                          (dashboardStats.convertedLeads /
                            dashboardStats.totalLeads) *
                          100
                        ).toFixed(1)
                      : "0"}
                    %
                  </div> */}
                  <div className="text-sm text-gray-500">Conversion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning-600">
                    ₹{dashboardStats.avgDealSize.toLocaleString("en-IN")}
                  </div>
                  <div className="text-sm text-gray-500">Avg. Deal Size</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Dashboard;
