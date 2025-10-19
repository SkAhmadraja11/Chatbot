import React from "react";

const Profile = ({ username }) => {
  return (
    <div style={{ padding: "20px" }}>
      <h3>👤 Profile Information</h3>
      <p><b>Username:</b> {username}</p>
      <p><b>Status:</b> Online ✅</p>
    </div>
  );
};

export default Profile;
