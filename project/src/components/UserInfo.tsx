import React from 'react';

export function UserInfo() {
  const user = { email: 'master@example.com' };
  const profile = { full_name: 'Master User', role: 'super_admin' };

  return (
    <div className="flex items-center space-x-3">
      <div className="flex flex-col">
        <span className="font-medium text-gray-900">{profile.full_name}</span>
        <span className="text-sm text-gray-500">{profile.role}</span>
      </div>
    </div>
  );
}