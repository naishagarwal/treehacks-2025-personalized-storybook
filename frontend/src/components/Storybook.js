import React, { useState, useEffect, useRef } from "react";
import { ReactComponent as MicIcon } from '../assets/mic.svg'; // Adjust the path to your SVG file
import { ReactComponent as BooksIcon } from '../assets/books.svg'; // Adjust the path to your SVG file
import { ReactComponent as SpeakerIcon } from '../assets/speaker.svg'; // Adjust the path to your SVG file

const Storybook = () => {
  const [page, setPage] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressTimer = useRef(null);

  const story = [
    {
      text: "One warm morning, Maya ran outside to check on her guava tree. 'Why are there no guavas yet?' she asked, tapping the trunk.",
      image: "https://media.istockphoto.com/id/479256936/vector/little-red-riding-hood-and-the-wolf.jpg?s=612x612&w=0&k=20&c=cOh_UdkV5ct8N3JRrFs5ru1a4KTnVFeeY-zVd1KcadI="
    },
    {
      text: "Her grandmother smiled. 'Guavas need time, Maya. Good things come to those who wait.'",
      image: "https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs/248477037/original/bef7fffaa7cf7d1302b487a7a0af533b473f28dc/do-charming-children-story-book-illustration.jpg"
    },
    {
      text: "Days passed, and one morning, Maya saw tiny green guavas on the branches. 'They're here!' she cheered, learning the power of patience.",
      image: "https://media.istockphoto.com/id/479256936/vector/little-red-riding-hood-and-the-wolf.jpg?s=612x612&w=0&k=20&c=cOh_UdkV5ct8N3JRrFs5ru1a4KTnVFeeY-zVd1KcadI="
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
    }, 65); // Adjust speed here - lower number = faster
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
      
      <div className="relative flex items-center justify-center min-h-[60vh]">
        {/* Navigation arrows */}
        <button 
          onClick={goToPrev} 
          className="absolute left-12 text-white text-6xl font-thin opacity-70 hover:opacity-100 transition-opacity z-10"
        >
          ‹
        </button>

        {/* Story content - Side by side layout */}
        <div className="w-full max-w-6xl flex gap-16 px-24">
          {/* Text section */}
          <div className="w-2/5 flex flex-col">
            <div className="text-2xl font-light leading-relaxed tracking-wide mb-12 font-serif">
              <AnimatedText text={story[page].text} />
            </div>
            
            {/* Control buttons - Now left aligned under text */}
            <div className="flex gap-8">
              <button 
                onClick={startReading}
                className="w-12 h-12 rounded-full border border-white flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <SpeakerIcon className="w-8 h-8"/>
              </button>
              <button className="w-12 h-12 rounded-full border border-white flex items-center justify-center hover:bg-white/10 transition-colors">
                <MicIcon className="w-8 h-8"/>
              </button>
              <button className="w-12 h-12 rounded-full border border-white flex items-center justify-center hover:bg-white/10 transition-colors">
               <BooksIcon className="w-8 h-7"/>
              </button>
            </div>
          </div>

          {/* Image section */}
          <div className="w-3/5 relative">
            <div className="aspect-square relative overflow-hidden rounded-lg">
              <img 
                src={story[page].image} 
                alt={`Story page ${page + 1}`} 
                className="w-full h-full object-cover"
              />
                {/* Stronger radial gradient overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,1)_100%)]"></div>

            </div>
          </div>
        </div>

        <button 
          onClick={goToNext} 
          className="absolute right-12 text-white text-6xl font-thin opacity-70 hover:opacity-100 transition-opacity z-10"
        >
          ›
        </button>
      </div>
  );
};

export default Storybook;