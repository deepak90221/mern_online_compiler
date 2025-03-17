import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Compiler from "./components/Compiler";

import "./App.css";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/compiler" element={<Compiler />} />
      
      </Routes>
    </Router>
  );
};

export default App;
