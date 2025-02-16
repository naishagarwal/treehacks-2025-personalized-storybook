import React from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as ProfileIcon } from '../assets/profile.svg'; // Adjust the path to your SVG file

const NavBar = ({ leftText = "generate new", centerText = "saved stories" }) => {
  return (
    <div className="px-12 py-8">
      <div className="flex items-center w-full text-white">
        {/* Navigation tabs group */}
        <div className="flex gap-8 text-xl font-light tracking-wider">
          <div className="opacity-70 hover:opacity-100 cursor-pointer transition-opacity">
            <Link 
                to="/generate" // Link to the 'new' page
                className="opacity-70 hover:opacity-100 cursor-pointer transition-opacity"
            >
            {leftText}
            </Link>
          </div>
          <div className="opacity-100 cursor-pointer">
            <Link 
                to="/saved" // Link to the 'saved stories' page
                className="opacity-100 cursor-pointer"
            >
            {centerText}
            </Link>
          </div>
        </div>
        
        {/* Horizontal line */}
        <div className="flex-1 mx-8 h-px bg-white/30" />
        
        {/* Profile icon */}
        <div className="w-10 h-10 rounded-full border border-white flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
            <Link 
                to="/profile" // Link to the 'new' page
                className="opacity-70 hover:opacity-100 cursor-pointer transition-opacity"
            >
            <ProfileIcon className="w-7 h-7 text-white" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NavBar;