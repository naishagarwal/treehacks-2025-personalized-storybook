import React, { useState } from 'react';

const Profile = () => {
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [gender, setGender] = useState('');
  const [race, setRace] = useState('');
  const [interests, setInterests] = useState('');

  const handleSave = async () => {
    const profileData = {
      nickname,
      age: Number(age), // Ensure age is a number
      location,
      gender,
      race,           // New race field added here
      interests,
    };

    try {
      const response = await fetch('http://localhost:8000/api/save_details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const data = await response.json();
        // Optionally, store the profile ID for later use
        localStorage.setItem("profile_id", data.profile_id);
        alert('Profile saved successfully!');
      } else {
        alert('Failed to save profile. Please try again.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-12 font-serif">
      <h1 className="text-3xl mb-6">Profile</h1>
      
      <div className="space-y-4">
        {/* Nickname Input */}
        <div>
          <label htmlFor="nickname" className="block text-xl mb-2">Nickname</label>
          <input
            type="text"
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white"
          />
        </div>

        {/* Age Input */}
        <div>
          <label htmlFor="age" className="block text-xl mb-2">Age</label>
          <input
            type="number"
            id="age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white"
          />
        </div>

        {/* Location Input (Optional) */}
        <div>
          <label htmlFor="location" className="block text-xl mb-2">Location (Optional)</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white"
          />
        </div>

        {/* Gender Input (Optional) */}
        <div>
          <label htmlFor="gender" className="block text-xl mb-2">Gender (Optional)</label>
          <input
            type="text"
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white"
          />
        </div>

        {/* Race Input */}
        <div>
          <label htmlFor="race" className="block text-xl mb-2">Race</label>
          <input
            type="text"
            id="race"
            value={race}
            onChange={(e) => setRace(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white"
          />
        </div>

        {/* Interests Input */}
        <div>
          <label htmlFor="interests" className="block text-xl mb-2">Interests</label>
          <textarea
            id="interests"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white"
            rows="6"
          />
        </div>
        
        {/* Save Button */}
        <div>
          <button
            onClick={handleSave}
            className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
