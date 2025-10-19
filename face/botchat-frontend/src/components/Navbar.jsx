import "./Navbar.css";

const Navbar = ({ onSectionChange, currentSection }) => {
  return (
    <nav className="navbar">
      <h2 className="logo">🤖 Note-G</h2>
      <ul>
        <li
          className={currentSection === "chat" ? "active" : ""}
          onClick={() => onSectionChange("chat")}
        >
          New Chat
        </li>
        <li
          className={currentSection === "history" ? "active" : ""}
          onClick={() => onSectionChange("history")}
        >
          History
        </li>
        <li
          className={currentSection === "profile" ? "active" : ""}
          onClick={() => onSectionChange("profile")}
        >
          Profile
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
