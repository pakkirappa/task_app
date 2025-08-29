import React from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import Layout from "../../components/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";
import { Plus, Edit, Trash2, Target, Calendar, DollarSign } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: "draft" | "active" | "paused" | "completed";
  budget: number;
  start_date: string;
  end_date: string;
  creator_first_name: string;
  creator_last_name: string;
  lead_count: number;
  created_at: string;
}

const statusStyles = {
  draft: "badge-gray",
  active: "badge-success",
  paused: "badge-warning",
  completed: "badge-primary",
};

const Campaigns: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: campaigns = [],
    isLoading,
    error,
  } = useQuery("campaigns", async () => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/campaigns`
    );
    return response.data.data;
  });

  const deleteMutation = useMutation(
    (campaignId: string) =>
      axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/campaigns/${campaignId}`
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("campaigns");
        toast.success("Campaign deleted successfully");
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Failed to delete campaign"
        );
      },
    }
  );

  const handleDelete = async (campaign: Campaign) => {
    if (window.confirm(`Are you sure you want to delete "${campaign.name}"?`)) {
      deleteMutation.mutate(campaign.id);
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

  if (error) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">
            <div className="text-danger-500 mb-4">Error loading campaigns</div>
            <button
              onClick={() => queryClient.invalidateQueries("campaigns")}
              className="btn-primary"
            >
              Try Again
            </button>
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
              <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
              <p className="text-gray-600">Manage your marketing campaigns</p>
            </div>
            <Link href="/campaigns/create" className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-primary-600 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">
                      Total
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {campaigns.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-success-600 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">
                      Active
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {
                        campaigns.filter((c: Campaign) => c.status === "active")
                          .length
                      }
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
                      Total Budget
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      ₹
                      {campaigns
                        .reduce(
                          (sum: number, c: Campaign) => sum + (c.budget || 0),
                          0
                        )
                        .toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-danger-600 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">
                      Total Leads
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {campaigns.reduce(
                        (sum: number, c: Campaign) =>
                          sum + (parseInt(c.lead_count.toString()) || 0),
                        0
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign List */}
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Target className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No campaigns
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new campaign.
              </p>
              <div className="mt-6">
                <Link href="/campaigns/create" className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  New Campaign
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
                        Campaign
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Budget
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Leads
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {campaigns.map((campaign: Campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {campaign.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {campaign.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`badge ${statusStyles[campaign.status]}`}
                          >
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {campaign.budget
                            ? `₹${campaign.budget.toLocaleString("en-IN")}`
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {campaign.lead_count}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div>
                            {campaign.start_date && (
                              <div>
                                Start:{" "}
                                {format(
                                  new Date(campaign.start_date),
                                  "MMM dd, yyyy"
                                )}
                              </div>
                            )}
                            {campaign.end_date && (
                              <div>
                                End:{" "}
                                {format(
                                  new Date(campaign.end_date),
                                  "MMM dd, yyyy"
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium space-x-2">
                          <Link
                            href={`/campaigns/${campaign.id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            View
                          </Link>
                          <Link
                            href={`/campaigns/${campaign.id}/edit`}
                            className="text-warning-600 hover:text-warning-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(campaign)}
                            disabled={deleteMutation.isLoading}
                            className="text-danger-600 hover:text-danger-900 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

export default Campaigns;
