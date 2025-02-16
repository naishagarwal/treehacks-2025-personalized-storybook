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
        headers: { 'Content-Type': 'application/json' },
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
    <div className="min-h-screen bg-[#050200] flex items-center justify-center">
      <div className="p-6 rounded-md w-1/3 space-y-5">
        <h1 className="text-2xl text-center font-light mb-6">Reader Profile</h1>

        <div className="flex justify-between items-center">
          <label htmlFor="nickname" className="text-sm">name/nickname</label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-50 p-2 bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded-md text-light"
          />
        </div>

        <div className="flex justify-between items-center">
          <label htmlFor="age" className="text-sm">age</label>
          <input
            id="age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-50 p-2 bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded-md text-light"
          />
        </div>

        <div className="flex justify-between items-center">
          <label htmlFor="location" className="text-sm">location (optional)</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-50 p-2 bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded-md text-light"
          />
        </div>

        <div className="flex justify-between items-center">
          <label htmlFor="gender" className="text-sm">gender (optional)</label>
          <input
            id="gender"
            type="text"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-50 p-2 bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded-md text-light"
          />
        </div>

        {/* Race Input */}
        <div className="flex justify-between items-center">
          <label htmlFor="gender" className="text-sm">race (optional)</label>
          <input
            id="gender"
            type="text"
            value={gender}
            onChange={(e) => setRace(e.target.value)}
            className="w-50 p-2 bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded-md text-light"
          />
        </div>

        {/* Interests Input */}
        <div>
          <label htmlFor="interests" className="block text-xl mb-2">Interests</label>
          <textarea
            id="interests"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            className="w-90 h-24 p-2 bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded-md text-light"
          />
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleSave}
            className="mt-4 px-6 py-2 border border-white text-white font-serif rounded-md hover:bg-white/10 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
