import React, { useState } from 'react';

const MoodTracker: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const moodTypes = ['Happy', 'Sad', 'Angry', 'Neutral', 'Excited'];

  const handleMoodClick = (mood: string) => {
    setSelectedMood(mood);
  };

  return (
    <div>
      <h2>Mood Tracker</h2>
      <div className="mood-buttons">
        {moodTypes.map((mood) => (
          <button
            key={mood}
            onClick={() => handleMoodClick(mood)}
            className="mood-button"
          >
            {mood}
          </button>
        ))}
      </div>
      {selectedMood && (
        <div className="selected-mood">
          <p>You selected: {selectedMood}</p>
        </div>
      )}
    </div>
  );
};

export default MoodTracker;