import React, { useState, useEffect, useRef } from "react";
import { ReactComponent as MicIcon } from '../assets/mic.svg';
import { ReactComponent as BooksIcon } from '../assets/books.svg';
import { ReactComponent as SpeakerIcon } from '../assets/speaker.svg';

const Storybook = () => {
  const [page, setPage] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressTimer = useRef(null);

  const story = [
    {
      text: "One warm morning, Maya ran outside to check on her guava tree. 'Why are there no guavas yet?' she asked, tapping the trunk.",
      video: "https://storage.cdn-luma.com/dream_machine/0243eeeb-bb11-4b39-b2ab-82739f247285/c2e848ea-a4ba-4480-83ea-1e985d83543b_result5e59403281346a5d.mp4"
    },
    {
      text: "Her grandmother smiled. 'Guavas need time, Maya. Good things come to those who wait.'",
      video: "https://storage.cdn-luma.com/dream_machine/22d8a3e0-b58b-434e-be20-11aa4690c8db/90048fd5-2d7c-4cc1-b4ae-59c0f0d7a452_result585a99847c952352.mp4"
    },
    {
      text: "Days passed, and one morning, Maya saw tiny green guavas on the branches. 'They're here!' she cheered, learning the power of patience.",
      video: "https://storage.cdn-luma.com/dream_machine/edae50b5-5f4a-4fd6-a1f2-3e1bcc8ed6be/9674fb89-9b1b-44f5-a865-94ada6dd91a4_result73412e38eec02411.mp4"
    }
  ];

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
  };

  useEffect(() => {
    stopReading();
  }, [page]);

  const goToPrev = () => {
    setPage((p) => Math.max(p - 1, 0));
    stopReading();
  };

  const goToNext = () => {
    setPage((p) => Math.min(p + 1, story.length - 1));
    stopReading();
  };

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

      {/* Main content */}
      <div className="flex-1 relative ">
        {/* Text container - positioned absolutely to allow overlap */}
        <div className="absolute z-10 left-16 top-1/4 w-1/3">
          <div className="text-3xl font-light leading-relaxed tracking-wide text-white/90 font-serif mb-12">
            <AnimatedText text={story[page].text} />
          </div>

          {/* Control buttons */}
          <div className="flex gap-6">
            <button 
              onClick={startReading}
              className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors"
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

        {/* Video container - right aligned */}
        <div className="relative w-2/3 aspect-video ml-auto">
          <video 
            src={story[page].video} 
            autoPlay 
            loop 
            muted
            className="w-full object-cover"
          />
          {/* Strong fade overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050200] via-[#050200]/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050200] via-transparent to-[#050200]"></div>
        </div>
        {/* Navigation arrows */}
        <button 
            onClick={goToPrev} 
            className="absolute left- top-1/2 -translate-y-1/2 text-white text-6xl font-thin opacity-70 hover:opacity-100 transition-opacity"
          >
            ‹
          </button>
          <button 
            onClick={goToNext} 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-6xl font-thin opacity-70 hover:opacity-100 transition-opacity"
          >
            ›
          </button>
      </div>
    </div>
  );
};

export default Storybook;