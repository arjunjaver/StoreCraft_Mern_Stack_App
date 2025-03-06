import "./App.css";
import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import AddProduct from "./components/AddProduct";
import { useState, useEffect } from "react";

function App() {
  const [mode, setMode] = useState(localStorage.getItem("mode") || "light");

  useEffect(() => {
    // Apply the mode to the body when the component mounts
    document.body.classList.add(mode === "dark" ? "dark-mode" : "light-mode");
    document.body.style.backgroundColor = mode === "dark" ? "#363535" : "white";
  }, [mode]);

  const toggleMode = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    document.body.classList.remove("dark-mode", "light-mode");
    document.body.classList.add(
      newMode === "dark" ? "dark-mode" : "light-mode"
    );
    document.body.style.backgroundColor =
      newMode === "dark" ? "#363535" : "white";
    localStorage.setItem("mode", newMode); // Save the mode to localStorage
  };

  return (
    <div>
      <Router>
        <Navbar mode={mode} toggleMode={toggleMode} />
        <Routes>
          <Route path="/" element={<Home mode={mode} />} />
          <Route path="/addProduct" element={<AddProduct mode={mode} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
