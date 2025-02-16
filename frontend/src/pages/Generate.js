import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { ReactComponent as MicIcon } from '../assets/mic.svg'; // Adjust the path to your SVG file

const Generate = () => {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Ref to accumulate audio chunks
  const audioChunksRef = useRef([]);
  const mediaRecorderRef = useRef(null);

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

  // Start recording voice
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    // Clear the previous audio chunks when starting a new recording
    audioChunksRef.current = [];

    recorder.ondataavailable = (e) => {
      // Accumulate the audio chunks in the ref
      audioChunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      // Create the audio blob from accumulated chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
      // Send the audio to the backend
      transcribeAudio(audioBlob);
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  // Stop recording and transcribe audio
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      setIsRecording(false);
      mediaRecorderRef.current.stop();
    }
  };

  // Send audio to the backend for transcription
  const transcribeAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.mp3');

    try {
      const response = await fetch("http://localhost:8000/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.transcription) {
        setInput(data.transcription); // Set the transcribed text in input
        handleGenerate();
      } else {
        alert("Failed to transcribe audio.");
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
      alert("Failed to transcribe audio.");
    }
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
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          className={`mb-4 px-6 py-3 border-2 border-white rounded-full ${isRecording ? 'bg-red-500' : 'bg-transparent'} transition-all`}
        >
          <MicIcon className="w-9 h-9 text-white items-center" />
          Speak
        </button>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className={`px-6 py-3 border-2 border-white rounded-full transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white hover:text-yellow-500'}`}
        >
          {isLoading ? "Generating..." : "Create storybook"}
        </button>
      </div>
    </div>
  );
};

export default Generate;
