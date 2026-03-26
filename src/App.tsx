import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Vocab from "./pages/Vocab";
import Strategy from "./pages/Strategy";
import Planners from "./pages/Planners";
import About from "./pages/About";
import Arena from "./pages/Arena";
import Assets from "./pages/Assets";
import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>
      {/* Noise overlay for texture */}
      <div className="noise-overlay dark:opacity-5"></div>
      
      <div className="min-h-screen flex flex-col relative z-10 w-full dark:bg-[#0A0A0A] transition-colors duration-500">
        <Navbar />
        {/* Generous top and bottom spacing, wider constrained width for readability */}
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 py-16 animate-fade-up delay-100">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vocab" element={<Vocab />} />
            <Route path="/arena" element={<Arena />} />
            <Route path="/strategy" element={<Strategy />} />
            <Route path="/planners" element={<Planners />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
