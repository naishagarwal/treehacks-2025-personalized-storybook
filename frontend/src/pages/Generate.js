import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";

const Generate = () => {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch profile details on component mount
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

  // Handle story generation
  const handleGenerate = async () => {
    if (!profile) {
      alert("Profile details are not loaded yet. Please complete your profile first.");
      return;
    }

    setIsLoading(true);

    const requestPayload = {
      user_input: input,
      child_profile: profile,
    };

    try {
      const response = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });
      const data = await response.json();

      if (data.story_id) {
        navigate(`/story/${data.story_id}`);
      } else {
        throw new Error("Story ID missing in response.");
      }
    } catch (error) {
      console.error("Error generating story:", error);
      alert("Failed to generate story. Please try again.");
    } finally {
      setIsLoading(false);
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
    setIsRecording(false);
  };

  return (
    <div>
      <NavBar />
      <div className="flex flex-col items-center justify-center h-screen text-white">
        <h1 className="text-2xl font-light mb-6">Describe your story...</h1>

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
            setIsRecording(true);
            handleVoiceInputStart();
          }}
          onMouseUp={handleVoiceInputEnd}
          onTouchStart={() => setIsRecording(true)}
          onTouchEnd={handleVoiceInputEnd}
          className={`mb-4 px-6 py-3 border-2 border-white rounded-full ${isRecording ? 'bg-red-500' : 'bg-transparent'} transition-all`}
        >
          Speak
        </button>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className={`px-6 py-3 border-2 border-white rounded-full transition-colors ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white hover:text-yellow-500'
          }`}
        >
          {isLoading ? "Generating..." : "Generate Story"}
        </button>
      </div>
    </div>
  );
};

export default Generate;
