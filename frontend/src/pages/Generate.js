import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";

const Generate = () => {
  const [input, setInput] = useState("");
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  // Fetch profile details on component mount using the stored profile_id
  useEffect(() => {
    const profileId = localStorage.getItem("profile_id");
    if (profileId) {
      fetch(`http://localhost:8000/api/profile/${profileId}`)
        .then((res) => res.json())
        .then((data) => setProfile(data))
        .catch((err) => {
          console.error("Failed to fetch profile:", err);
        });
    }
  }, []);

  // Handle story generation using both the user's input and the profile details
  const handleGenerate = async () => {
    if (!profile) {
      alert("Profile details are not loaded yet. Please complete your profile first.");
      return;
    }

    const requestPayload = {
      user_input: input,
      child_profile: profile, // Use the profile details fetched from the backend
    };

    try {
      const response = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });
      const data = await response.json();
      navigate(`/story/${data.story_id}`);
    } catch (error) {
      console.error("Error generating story:", error);
      alert("Failed to generate story. Please try again.");
    }
  };

  // Simple voice input functionality
  const handleVoiceInput = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
    };
    recognition.start();
  };

  return (
    <div>
      <NavBar />
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
        <h1 className="text-2xl mb-4">Describe Your Story</h1>
        <textarea
          className="w-1/2 h-32 p-4 mb-4 text-black"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a story description here..."
        />
        <button onClick={handleVoiceInput} className="mb-4 px-4 py-2 bg-gray-700 rounded">
          🎤 Speak
        </button>
        <button onClick={handleGenerate} className="px-6 py-2 bg-yellow-500 text-black rounded">
          Generate Story
        </button>
      </div>
    </div>
  );
};

export default Generate;
