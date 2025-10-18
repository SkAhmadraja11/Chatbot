import React, { useState } from "react";
import Auth from "./components/AuthCard";
import Chat from "./components/Chat";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // ✅ Callback when login/register succeeds
  const handleAuthSuccess = (username) => {
    setUser(username);
    setIsAuthenticated(true);
  };

  return (
    <div>
      {!isAuthenticated ? (
        <Auth onAuthSuccess={handleAuthSuccess} />
      ) : (
        <Chat username={user} />
      )}
    </div>
  );
};

export default App;
