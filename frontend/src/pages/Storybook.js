import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Storybook from "../components/Storybook";
import NavBar from '../components/NavBar';

const StoryPage = () => {
  const { storyId } = useParams();
  const [story, setStory] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:8000/story/${storyId}`)
      .then((res) => res.json())
      .then((data) => setStory(data.pages));
  }, [storyId]);

  return (
    <div className="text-white h-screen">
      <NavBar />
      <Storybook story={story} />
    </div>
  );
};

export default StoryPage;
