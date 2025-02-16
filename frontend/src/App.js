import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Generate from "./pages/Generate";
import Storybook from "./pages/Storybook";
import Saved from "./pages/Saved";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Generate />} />
        <Route path="/story/:storyId" element={<Storybook />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
