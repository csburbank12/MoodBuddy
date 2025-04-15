import React from 'react';

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  content: string;
  fromColor: string;
  borderColor : string;
}

const Section: React.FC<SectionProps> = ({ icon, title, content, fromColor, borderColor }) => {
  return (
    <div className={`bg-gradient-to-br from-${fromColor} to-white p-8 rounded-2xl shadow-sm border border-${borderColor}`}>
      <div className={`bg-${fromColor} w-12 h-12 rounded-lg flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="text-gray-600">{content}</p>
    </div>
  );
};

export default Section;