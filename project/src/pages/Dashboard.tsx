import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, BarChart, Calendar, Bell } from 'lucide-react';
import { useState } from 'react';

export default function Dashboard() {
  const { user, profile } = useAuth();
  
  console.log("🔍 Dashboard Mount", {
    user: user?.email,
    profile: profile?.full_name,
    role: profile?.role
  });
  const [activeTab, setActiveTab] = useState('overview');


  const TeacherDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <h3 className="text-2xl font-bold text-gray-900">156</h3>
            </div>
            <Users className="h-8 w-8 text-coral-orange" />
          </div>
          <div className="mt-2">
            <span className="text-xs text-green-500">↑ 12% </span>
            <span className="text-xs text-gray-500">from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Support Cases</p>
              <h3 className="text-2xl font-bold text-gray-900">23</h3>
            </div>
            <Bell className="h-8 w-8 text-cloud-blue" />
          </div>
          <div className="mt-2">
            <span className="text-xs text-orange-500">↑ 3 </span>
            <span className="text-xs text-gray-500">new cases today</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Upcoming Meetings</p>
              <h3 className="text-2xl font-bold text-gray-900">8</h3>
            </div>
            <Calendar className="h-8 w-8 text-sunny-yellow" />
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Next: </span>
            <span className="text-xs text-blue-500">In 2 hours</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Mood Score</p>
              <h3 className="text-2xl font-bold text-gray-900">4.2</h3>
            </div>
            <BarChart className="h-8 w-8 text-calm-green" />
          </div>
          <div className="mt-2">
            <span className="text-xs text-green-500">↑ 0.3 </span>
            <span className="text-xs text-gray-500">this week</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <div className="mt-4 space-y-4">
              {[
                { student: "Emma Thompson", action: "Completed mood check-in", time: "10 minutes ago" },
                { student: "James Wilson", action: "Requested support meeting", time: "25 minutes ago" },
                { student: "Sarah Parker", action: "Achieved weekly goal", time: "1 hour ago" },
                { student: "Michael Brown", action: "Updated behavior record", time: "2 hours ago" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.student}</p>
                    <p className="text-xs text-gray-500">{activity.action}</p>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900">Students Needing Attention</h3>
            <div className="mt-4 space-y-4">
              {[
                { name: "David Lee", reason: "Declining mood trend", urgency: "high" },
                { name: "Anna Martinez", reason: "Missed check-ins", urgency: "medium" },
                { name: "Ryan Taylor", reason: "Support request pending", urgency: "medium" },
                { name: "Sophie Chen", reason: "Goal progress stalled", urgency: "low" }
              ].map((student, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      student.urgency === 'high' ? 'bg-red-500' :
                      student.urgency === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.reason}</p>
                    </div>
                  </div>
                  <button className="text-xs text-coral-orange hover:text-opacity-80">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!user || !profile) {
    return null;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile.full_name}
        </h1>
        <p className="text-gray-600">
          {profile.specialization} | {new Date().toLocaleDateString()}
        </p>
      </div>
      
      {profile.role === 'staff' && <TeacherDashboard />}
    </div>
  );
}