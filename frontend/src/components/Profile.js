import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null); // State to store user data
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const navigate = useNavigate();

  // Fetch user profile data on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    // Fetch the signed-in user's profile information
    fetch('http://localhost:5000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error fetching user profile');
        }
        return response.json();
      })
      .then((data) => {
        setUser(data.user);
        setFollowers(data.user.followers); // Update to match the new structure
        setFollowing(data.user.following); // Update to match the new structure
      })
      .catch((error) => console.error('Error fetching user profile:', error));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (!user) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <FontAwesomeIcon icon={faUser} className="profile-icon" />
        <h2>{user.username}</h2>
      </div>
      <div className="profile-info">
        <div className="profile-section">
          <p><strong>{following.length}</strong> Following</p>
          <p><strong>{followers.length}</strong> Followers</p>
        </div>
      </div>

      <div className="profile-actions">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
