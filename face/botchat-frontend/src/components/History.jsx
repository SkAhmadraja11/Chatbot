import React from "react";

const History = ({ username }) => {
  return (
    <div style={{ padding: "20px" }}>
      <h3>{username}’s Chat History</h3>
      <p>🕒 This will display your past chats (to be fetched from backend later).</p>
    </div>
  );
};

export default History;
