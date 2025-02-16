import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from '../components/NavBar';

const Generate = () => {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  // Handle form submission
  const handleGenerate = async () => {
    const response = await fetch("http://localhost:8000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: input })
    });
    const data = await response.json();
    navigate(`/story/${data.story_id}`);
  };

  // Simple voice input
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
        <div className="flex flex-col items-center justify-center h-screen text-white">
        <h1 className="text-2xl mb-4">Describe Your Story</h1>
        <textarea
            className="w-1/2 h-32 p-4 mb-4 text-black"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a story description here..."
        />
        <button onClick={handleVoiceInput} className="mb-4 px-4 py-2 bg-gray-700 rounded">🎤 Speak</button>
        <button onClick={handleGenerate} className="px-6 py-2 bg-yellow-500 text-black rounded">Generate Story</button>
        </div>
    </div>
  );
};

export default Generate;
