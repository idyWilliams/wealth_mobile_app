import { useMutation, useQuery } from "@tanstack/react-query";
import {
  User,
  InsertUser,
  InsertIndividualProfile,
  InsertBusinessProfile,
} from "@shared/schema";

const API_URL = "http://localhost:3000"; // Change this to your API URL

// API client functions
const api = {
  async createUser(userData: InsertUser): Promise<User> {
    const response = await fetch(`${API_URL}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create user");
    }

    return response.json();
  },

  async createIndividualProfile(
    profileData: InsertIndividualProfile
  ): Promise<any> {
    const response = await fetch(`${API_URL}/api/individual-profiles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create individual profile");
    }

    return response.json();
  },

  async createBusinessProfile(
    profileData: InsertBusinessProfile
  ): Promise<any> {
    const response = await fetch(`${API_URL}/api/business-profiles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create business profile");
    }

    return response.json();
  },
};

// React Query hooks
export const useCreateUser = () => {
  return useMutation({
    mutationFn: api.createUser,
  });
};

export const useCreateIndividualProfile = () => {
  return useMutation({
    mutationFn: api.createIndividualProfile,
  });
};

export const useCreateBusinessProfile = () => {
  return useMutation({
    mutationFn: api.createBusinessProfile,
  });
};
