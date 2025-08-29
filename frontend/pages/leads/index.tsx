import React from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import Layout from "../../components/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";
import { Plus, Download, Users, TrendingUp, DollarSign } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  status: string;
  source: string;
  value: number;
  campaign_name: string;
  created_at: string;
}

const statusStyles = {
  new: "badge-gray",
  contacted: "badge-primary",
  qualified: "badge-warning",
  proposal: "badge-success",
  won: "badge-success",
  lost: "badge-danger",
};

const Leads: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery("leads", async () => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/leads`
    );
    return response.data.data;
  });

  const { data: stats } = useQuery("leads-stats", async () => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/leads/stats/overview`
    );
    return response.data.data.overview;
  });

  const handleExportCSV = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/leads/export/csv`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `leads-export-${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("CSV export downloaded");
    } catch (error) {
      toast.error("Failed to export CSV");
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card">
                <div className="card-body">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
              <p className="text-gray-600">Manage your sales leads</p>
            </div>
            <div className="flex space-x-3">
              <button onClick={handleExportCSV} className="btn-outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
              <Link href="/leads/create" className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                New Lead
              </Link>
            </div>
          </div>

          {/* Stats */}
          {stats && (
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
                        {stats.total_leads}
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
                        Won
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {stats.won_leads}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-warning-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">
                        Revenue
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        ₹{stats.total_won_value?.toLocaleString("en-IN") || "0"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-danger-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">
                        Conversion Rate
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {stats.conversion_rate?.toFixed(1) || "0"}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leads Table */}
          {leads.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No leads
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new lead.
              </p>
              <div className="mt-6">
                <Link href="/leads/create" className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  New Lead
                </Link>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campaign
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leads.map((lead: Lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {lead.first_name} {lead.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {lead.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {lead.company || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`badge ${
                              statusStyles[
                                lead.status as keyof typeof statusStyles
                              ] || "badge-gray"
                            }`}
                          >
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                          {lead.source}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {lead.value
                            ? `₹${lead.value.toLocaleString("en-IN")}`
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {lead.campaign_name || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Leads;
