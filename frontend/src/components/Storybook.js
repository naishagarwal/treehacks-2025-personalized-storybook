import React, { useState, useEffect, useRef } from "react";
import { ReactComponent as MicIcon } from '../assets/mic.svg';
import { ReactComponent as BooksIcon } from '../assets/books.svg';
import { ReactComponent as SpeakerIcon } from '../assets/speaker.svg';

const Storybook = ({ storyPages, onPageRequest }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isReading, setIsReading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const progressTimer = useRef(null);
  const audioRef = useRef(null);

  // Prefetch next page
  useEffect(() => {
    const nextPage = currentPage + 1;
    if (!storyPages[nextPage]) {
      onPageRequest(nextPage);
    }
  }, [currentPage, storyPages]);

  const startReading = () => {
    setIsReading(true);
    setProgress(0);
    clearInterval(progressTimer.current);
    progressTimer.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer.current);
          return 100;
        }
        return prev + 1;
      });
    }, 65);
  };

  const stopReading = () => {
    setIsReading(false);
    clearInterval(progressTimer.current);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    stopReading();
  }, [currentPage]);

  const goToPrev = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      stopReading();
    }
  };

  const goToNext = async () => {
    const nextPage = currentPage + 1;
    if (!storyPages[nextPage]) {
      setIsLoading(true);
      await onPageRequest(nextPage);
      setIsLoading(false);
    }
    if (storyPages[nextPage]) {
      setCurrentPage(nextPage);
      stopReading();
    }
  };

  // Fetch and play audio
  const playAudio = async (text) => {
    if (!text) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (response.ok) {
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
          startReading();
        }
      } else {
        console.error('Failed to fetch audio');
      }
    } catch (error) {
      console.error('Error fetching audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentStory = storyPages[currentPage];
  if (!currentStory) return null;

  const AnimatedText = ({ text }) => {
    const words = text.split(' ');
    const progressPerWord = 100 / words.length;
    return (
      <span>
        {words.map((word, index) => (
          <span
            key={index}
            className="transition-colors duration-300"
            style={{
              color: progress >= index * progressPerWord ? '#FCD34D' : 'white'
            }}
          >
            {word}{' '}
          </span>
        ))}
      </span>
    );
  };

  return (
    <div className="h-9/10 flex flex-col px-8 py-6">
      <div className="flex-1 relative">
        <div className="absolute z-10 left-16 top-1/4 w-1/3">
          <div className="text-3xl font-light leading-relaxed tracking-wide text-white/90 font-serif mb-12">
            <AnimatedText text={currentStory.text} />
          </div>

          <div className="flex gap-6">
            <button 
              onClick={() => playAudio(currentStory.text)}
              className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors"
              disabled={isLoading}
            >
              <SpeakerIcon className="w-6 h-6 text-white/90"/>
            </button>
            <button 
              className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <MicIcon className="w-6 h-6 text-white/90"/>
            </button>
            <button 
              className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <BooksIcon className="w-6 h-6 text-white/90"/>
            </button>
          </div>
        </div>

        <div className="relative w-2/3 aspect-video ml-auto">
          <video 
            src={currentStory.video} 
            autoPlay 
            loop 
            muted
            className="w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050200] via-[#050200]/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050200] via-transparent to-[#050200]"></div>
        </div>

        <button 
          onClick={goToPrev} 
          className="absolute left-0 top-1/2 -translate-y-1/2 text-white text-6xl font-thin opacity-70 hover:opacity-100 transition-opacity"
          disabled={currentPage === 1 || isLoading}
        >
          ‹
        </button>
        <button 
          onClick={goToNext} 
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-6xl font-thin opacity-70 hover:opacity-100 transition-opacity"
          disabled={isLoading}
        >
          ›
        </button>
      </div>
      <audio ref={audioRef} />
    </div>
  );
};

export default Storybook;
