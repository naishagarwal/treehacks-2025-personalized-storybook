import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Generate from "./pages/Generate";
import StoryPage from "./pages/StoryPage";
import Saved from "./pages/Saved";
import Profile from "./pages/Profile";
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generate" element={<Generate />} />
        <Route path="/story/:storyId" element={<StoryPage />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
