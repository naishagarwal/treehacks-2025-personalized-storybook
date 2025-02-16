import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Storybook from "../components/Storybook";
import NavBar from '../components/NavBar';

const StoryPage = () => {
  const { storyId } = useParams();
  const [storyPages, setStoryPages] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPage = async (pageNumber) => {
    try {
      const response = await fetch(`http://localhost:8000/story_video/${storyId}/${pageNumber}`);
      const data = await response.json();
      
      if (data.error || !data.content || !data.video_url) {
        return null;
      }

      setStoryPages(prev => ({
        ...prev,
        [pageNumber]: {
          text: data.content,
          video: data.video_url
        }
      }));
      
      return data;
    } catch (error) {
      console.error(`Error fetching page ${pageNumber}:`, error);
      setError("Failed to fetch page");
      return null;
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetchPage(1).then(() => setIsLoading(false));
  }, [storyId]);

  if (error) {
    return <div className="text-white p-4">Error: {error}</div>;
  }

  return (
    <div className="text-white h-screen">
      <NavBar />
      {!isLoading && (
        <Storybook 
          storyPages={storyPages} 
          onPageRequest={fetchPage}
        />
      )}
    </div>
  );
};

export default StoryPage;