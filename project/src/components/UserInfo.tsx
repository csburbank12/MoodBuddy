import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export function UserInfo() {
  const { user, profile, loading } = useAuth();

  console.log("🔍 UserInfo Component", {
    loading,
    authenticated: !!user,
    hasProfile: !!profile,
    email: user?.email,
    name: profile?.full_name
  });

  if (loading) {
    console.log("⏳ UserInfo loading...");
    return (
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 bg-coral-orange/30 rounded-full animate-pulse"></div>
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  if (!user || !profile) {
    console.log("⚠️ UserInfo: No user or profile");
    return (
      <div className="text-gray-500">
        Not signed in
      </div>
    );
  }

  console.log("✅ UserInfo: Rendering user", profile.full_name);
  return (
    <div className="flex items-center space-x-3">
      <div className="flex flex-col">
        <span className="font-medium text-gray-900">{profile.full_name}</span>
        <span className="text-sm text-gray-500">{profile.role}</span>
      </div>
    </div>
  );
}