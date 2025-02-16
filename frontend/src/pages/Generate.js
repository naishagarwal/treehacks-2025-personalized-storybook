import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";

const Generate = () => {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);  // State to track recording status
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

  // Simple voice input
  const handleVoiceInputStart = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
    };
    recognition.start();
  };

  const handleVoiceInputEnd = () => {
    setIsRecording(false);  // Stop recording once the button is released
  };

  return (
    <div>
      <NavBar />
      <div className="flex flex-col items-center justify-center h-screen text-white">
        <h1 className="text-2xl font-light mb-6">Describe your story...</h1> {/* Title styling */}

        {/* Main input box */}
        <textarea
          className="w-1/2 h-32 p-4 mb-4 bg-white/10 border border-white text-white font-serif rounded-lg"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a story description here..."
        />

        {/* Speak button */}
        <button
          onMouseDown={() => {
            setIsRecording(true);  // Start recording when the button is pressed
            handleVoiceInputStart();
          }}
          onMouseUp={handleVoiceInputEnd}  // Stop recording when the button is released
          onTouchStart={() => setIsRecording(true)}
          onTouchEnd={handleVoiceInputEnd}
          className={`mb-4 px-6 py-3 border-2 border-white rounded-full ${isRecording ? 'bg-red-500' : 'bg-transparent'} transition-all`}
        >
          {/* No emoji */}
          Speak
        </button>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          className="px-6 py-3 border-2 border-white rounded-full hover:bg-white hover:text-yellow-500 transition-colors"
        >
          Generate Story
        </button>
      </div>
    </div>
  );
};

export default Generate;
