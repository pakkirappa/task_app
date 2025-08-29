import React, { useState } from "react";
import { useRouter } from "next/router";
import { useMutation, useQueryClient } from "react-query";
import axios from "axios";
import Layout from "../../components/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface CampaignFormData {
  name: string;
  description: string;
  status: "draft" | "active" | "paused" | "completed";
  budget: string;
  start_date: string;
  end_date: string;
}

const CreateCampaign: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CampaignFormData>({
    name: "",
    description: "",
    status: "draft",
    budget: "",
    start_date: "",
    end_date: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useMutation(
    (data: any) =>
      axios.post(`${process.env.NEXT_PUBLIC_API_URL}/campaigns`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("campaigns");
        toast.success("Campaign created successfully");
        router.push("/campaigns");
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Failed to create campaign"
        );
      },
    }
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Campaign name is required";
    }

    if (formData.budget && isNaN(parseFloat(formData.budget))) {
      newErrors.budget = "Budget must be a valid number";
    }

    if (
      formData.start_date &&
      formData.end_date &&
      formData.start_date > formData.end_date
    ) {
      newErrors.end_date = "End date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      budget: formData.budget ? parseFloat(formData.budget) : null,
    };

    createMutation.mutate(submitData);
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/campaigns"
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Create Campaign
                </h1>
                <p className="text-gray-600">Add a new marketing campaign</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="card max-w-2xl">
            <form onSubmit={handleSubmit} className="card-body space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Campaign Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className={`form-input mt-1 ${
                    errors.name
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  placeholder="Enter campaign name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="form-textarea mt-1"
                  placeholder="Describe your campaign..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="form-select mt-1"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="budget"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Budget (₹)
                  </label>
                  <input
                    id="budget"
                    name="budget"
                    type="number"
                    step="0.01"
                    className={`form-input mt-1 ${
                      errors.budget
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    placeholder="0.00"
                    value={formData.budget}
                    onChange={handleInputChange}
                  />
                  {errors.budget && (
                    <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="start_date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Start Date
                  </label>
                  <input
                    id="start_date"
                    name="start_date"
                    type="date"
                    className="form-input mt-1"
                    value={formData.start_date}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="end_date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    End Date
                  </label>
                  <input
                    id="end_date"
                    name="end_date"
                    type="date"
                    className={`form-input mt-1 ${
                      errors.end_date
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    value={formData.end_date}
                    onChange={handleInputChange}
                  />
                  {errors.end_date && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.end_date}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Link href="/campaigns" className="btn-outline">
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={createMutation.isLoading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Campaign
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default CreateCampaign;
