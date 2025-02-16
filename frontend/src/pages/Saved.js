import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Saved.css';
import NavBar from '../components/NavBar';

const Saved = () => {
  const [stories, setStories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/saved-stories');
        if (!response.ok) throw new Error('Failed to fetch stories');
        const data = await response.json();
        setStories(data);
      } catch (error) {
        console.error('Error fetching stories:', error);
        const data = [
            { "story_id": 1, "title": "The Adventure Begins" },
            { "story_id": 2, "title": "Mystery of the Lost City" },
            { "story_id": 3, "title": "Space Odyssey 3000" },
            { "story_id": 4, "title": "The Enchanted Forest" },
            { "story_id": 5, "title": "Legends of the Sea" },
            { "story_id": 6, "title": "The Time Traveler" },
            { "story_id": 7, "title": "Secrets of the Pyramid" },
            { "story_id": 8, "title": "The Robot's Journey" },
            { "story_id": 9, "title": "Castle of Shadows" },
            { "story_id": 10, "title": "The Final Quest" }
        ]
        setStories(data)
      }
    };

    fetchStories();
  }, []);

  const handleClick = (storyId) => {
    navigate(`/story/${storyId}`);
  };

  return (
    <div>
    <NavBar />
    <div className="bookshelf-container">
    <h1 className="text-2xl text-center font-light mb-6">My Saved Stories</h1>
      <div className="bookshelf">
        {stories.map(({ story_id, title }) => (
          <div key={story_id} className="book" onClick={() => handleClick(story_id)}>
            <span className="book-title">{title}</span>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default Saved;