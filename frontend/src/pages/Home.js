import React, { useEffect } from 'react';
import './Home.css';  // Import the CSS for styling
import { Howl } from 'howler';


const Home = () => {

  // Shimmer effect sound on mouse move
  useEffect(() => {
    const sound = new Howl({
      src: ['https://cdn.freesound.org/previews/677/677131_8455865-lq.mp3'],  // You can replace this with the actual path of your sound file
      volume: 0.3,
      loop: false,
    });

    let canPlaySound = true;  // Flag to prevent rapid sound triggering
    let soundTimeout;

    const handleMouseMove = () => {
      if (canPlaySound) {
        canPlaySound = false;  // Disable playing sound immediately
        sound.play();          // Play the sound

        // After 2 seconds, enable playing the sound again
        soundTimeout = setTimeout(() => {
          canPlaySound = true;
        }, 2000);  // 2 seconds delay
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup event listener
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="home-container">
      {/* Large text */}
      <h1 className="main-text">It's storytime...</h1>

      {/* Get Started Button */}
      <div className="get-started-button-container">
        <button className="get-started-button font-light" onClick={() => window.location.href = '/profile'}>
          Get Started <span>&#8594;</span>
        </button>
      </div>
    </div>
  );
};

export default Home;
