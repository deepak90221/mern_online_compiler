import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import "./Navbar.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="logo">MERN Compiler</h1>
        <div className={`nav-links ${isOpen ? "open" : ""}`}>
          <Link to="/compiler" className="nav-item" onClick={() => setIsOpen(false)}>Compiler</Link>
        </div>
        <div className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </div>
      </div>
    </nav>
  );
}
