import React from 'react';
import { Link } from 'react-router-dom';
import { Cloud, Heart, Brain, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Cloud className="h-8 w-8 text-cloud-blue" />
              <span className="ml-2 text-xl font-bold text-gray-900">MoodBuddy</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">Log in</Link>
              <Link to="/signup" className="px-4 py-2 bg-coral-orange text-white rounded-lg hover:bg-opacity-90">
                Sign up free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="pt-40 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-cloud-blue to-coral-orange bg-clip-text text-transparent mb-6">
              Supporting Student Emotional Wellness
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Track your emotional well-being, connect with support, and develop healthy coping strategies.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="px-8 py-4 bg-coral-orange text-white rounded-lg hover:bg-opacity-90 flex items-center justify-center w-full sm:w-auto"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a
                to="/login"
                className="px-8 py-4 border border-gray-200 rounded-lg hover:border-coral-orange text-gray-600 hover:text-coral-orange flex items-center justify-center w-full sm:w-auto"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>

        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-sm border border-blue-100">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                  <Brain className="h-6 w-6 text-cloud-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Smart Mood Tracking</h3>
                <p className="text-gray-600">Track your emotional journey with personalized insights.</p>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-white p-8 rounded-2xl shadow-sm border border-red-100">
                <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                  <Heart className="h-6 w-6 text-coral-orange" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Expert Support</h3>
                <p className="text-gray-600">Connect with professionals when you need support.</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl shadow-sm border border-green-100">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                  <Brain className="h-6 w-6 text-calm-green" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Progress Tracking</h3>
                <p className="text-gray-600">Monitor your growth and celebrate improvements.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}