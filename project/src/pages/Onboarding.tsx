import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, School, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface  OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    options?: string[];
    required?: boolean;
  }>;
}

const roleSteps: Record<string, OnboardingStep[]> = {
  student: [
    {
      id: 'personal',
      title: 'Tell us about yourself',
      description: 'Help us personalize your experience',
      icon: <User className="w-6 h-6" />,
      fields: [
        { name: 'full_name', label: 'Full Name', type: 'text', required: true },
        { name: 'grade_level', label: 'Grade Level', type: 'select', options: ['6th', '7th', '8th', '9th', '10th', '11th', '12th'], required: true },
        { name: 'age_group', label: 'Age Group', type: 'select', options: ['kids', 'teens'], required: true }
      ]
    },
    { id: 'preferences',
      title: 'Your Preferences',
      description: 'Customize your learning environment',
      icon: <BookOpen className="w-6 h-6" />,
      fields: [
        { name: 'theme_preference', label: 'Theme', type: 'select', options: ['light', 'dark'], required: true },
        { name: 'specialization', label: 'Areas of Interest', type: 'text' }
      ]
    }
  ],
  staff: [
    {
      id: 'personal',
      title: 'Professional Information',
      description: 'Tell us about your role',
      icon: <School className="w-6 h-6" />,
      fields:  [
         { name: 'full_name', label: 'Full Name', type: 'text', required: true },
         { name: 'specialization', label: 'Specialization', type: 'text', required: true },
         { name: 'school', label: 'School Name', type: 'text', required: true }
      ]
    }
  ]
};

export default function Onboarding() {
  const { user } = useAuth();
  const user = { id: '11111111-1111-1111-1111-111111111111', email: 'master@example.com' };
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveAttempted, setSaveAttempted] = useState(false);

  async function handleRoleSelection(selectedRole: string) {
    setRole(selectedRole);
    setFormData({ role: selectedRole });
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }

  async function handleSubmit() {
    if (!user) return;
    
    setError(null);
    setLoading(true);
    setSaveAttempted(true);

    try {
      if (!formData.full_name || formData.full_name.trim().length < 2) {
        throw new Error('Full name is required and must be at least 2 characters');
      }

      const role = 'staff';
      // if (role === 'student') {
      //   if (!formData.grade_level) {
      //     throw new Error('Grade level is required for students');
      //   }
      //   if (!formData.age_group) {
      //     throw new Error('Age group is required for students');
      //   }

      if (role === 'staff' && !formData.specialization) {
        throw new Error('Specialization is required for staff');
      }

      // Start a transaction by using RPC
      const { data, error } = await supabase.rpc('create_user_profile', {
        p_user_id: user.id,
        p_email: user.email,
        p_full_name: formData.full_name,
        p_role: 'staff',
        p_grade_level: null,
        p_age_group: formData.age_group,
        p_specialization: formData.specialization,
        p_theme_preference: formData.theme_preference
      });

      if (error) throw error;

      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save profile. Please try again.';
      setError(errorMessage);
      console.error('Onboarding error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (<div>Onboarding</div>);

  const steps = roleSteps[role];
  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {saveAttempted && error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          <div className="flex justify-center">
            {currentStepData.icon}
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">{currentStepData.title}</h2>
          <p className="mt-2 text-sm text-gray-600">{currentStepData.description}</p>
        </div>

        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {currentStepData.fields.map(field => (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-coral-orange focus:border-coral-orange rounded-md"
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coral-orange focus:border-coral-orange"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Back
              </button>
            )}
            <button
              onClick={currentStep === steps.length - 1 ? handleSubmit : () => setCurrentStep(prev => prev + 1)}
              disabled={loading}
              className="ml-auto flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-coral-orange hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coral-orange"
            >
              {loading ? (
                <span>Processing...</span>
              ) : currentStep === steps.length - 1 ? (
                <>
                  <span>Complete Setup</span>
                  <CheckCircle className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Next Step</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-center space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === currentStep ? 'bg-coral-orange' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}