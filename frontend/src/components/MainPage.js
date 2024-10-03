import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome, faHashtag, faBell, faEnvelope, faBookmark, faList, faUser, faFeatherAlt, faEllipsisH, faHeart, faComment,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_TWEETS } from '../graphql/queries';
import { LIKE_TWEET, ADD_COMMENT } from '../graphql/mutations'; // Import your mutations
import '../styles/MainPage.css';
import PostTweet from './PostTweet';
import Modal from './Modal';

const MainPage = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [activeTab, setActiveTab] = useState('foryou');
  const [users, setUsers] = useState([]);
  const [likedTweets, setLikedTweets] = useState([]);
  const [comments, setComments] = useState({}); // Track comments for each tweet
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
    }
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'following') {
      fetch('http://localhost:5000/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then((response) => response.json())
        .then((data) => setUsers(data))
        .catch((error) => console.error('Error fetching users:', error));
    }
  }, [activeTab]);

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    if (section === 'home') {
      setActiveTab('foryou');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handlePostTweetClick = () => {
    setIsModalOpen(true); // Open the modal
  };

  const { loading, error, data } = useQuery(GET_TWEETS);
  const [likeTweet] = useMutation(LIKE_TWEET);
  const [addComment] = useMutation(ADD_COMMENT);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleFollow = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/follow/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const updatedUsers = await fetch('http://localhost:5000/api/auth/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }).then((res) => res.json());

        setUsers(updatedUsers);
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  const handleLike = async (tweetId) => {
    try {
      const userId = localStorage.getItem('userId');
      const { data } = await likeTweet({ variables: { tweetId, userId } });

      if (data) {
        setLikedTweets((prev) => 
          prev.includes(tweetId) 
            ? prev.filter(id => id !== tweetId) // Unlike
            : [...prev, tweetId] // Like
        );
      }
    } catch (error) {
      console.error('Error liking tweet:', error);
    }
  };

  const handleCommentChange = (tweetId, value) => {
    setComments({
      ...comments,
      [tweetId]: value,
    });
  };

  const handleCommentSubmit = async (tweetId) => {
    if (!comments[tweetId]) return; // Don't submit empty comments

    const newComment = comments[tweetId];
    try {
      const userId = localStorage.getItem('userId');
      await addComment({ variables: { tweetId, userId, content: newComment } });

      // Clear the comment input
      handleCommentChange(tweetId, ''); 
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="main-page">
      <div className="sidebar">
        <img
          src={require('../assets/images/TwitterLogo.avif')}
          alt="Twitter Logo"
          className="sidebar-twitter-logo"
        />
        <ul>
          <li onClick={() => handleSectionChange('home')}>
            <FontAwesomeIcon icon={faHome} /> Home
          </li>
          <li onClick={() => handleSectionChange('explore')}>
            <FontAwesomeIcon icon={faHashtag} /> Explore
          </li>
          <li>
            <FontAwesomeIcon icon={faBell} /> Notifications
          </li>
          <li>
            <FontAwesomeIcon icon={faEnvelope} /> Messages
          </li>
          <li>
            <FontAwesomeIcon icon={faBookmark} /> Bookmarks
          </li>
          <li>
            <FontAwesomeIcon icon={faList} /> Lists
          </li>
          <li onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faUser} /> Profile
          </li>
          {isProfileMenuOpen && (
            <ul className="profile-menu">
              <li onClick={handleLogout} style={{ cursor: 'pointer' }}>
                Logout
              </li>
            </ul>
          )}
          <li>
            <FontAwesomeIcon icon={faEllipsisH} /> More
          </li>
        </ul>
        <button className="post-button-sidebar" onClick={handlePostTweetClick}>
          <FontAwesomeIcon icon={faFeatherAlt} /> Tweet
        </button>
      </div>

      <div className="feed">
        {activeSection === 'home' && (
          <>
            <div className="home-tabs">
              <button
                className={`tab-button ${activeTab === 'foryou' ? 'active' : ''}`}
                onClick={() => handleTabChange('foryou')}
              >
                For You
              </button>
              <button
                className={`tab-button ${activeTab === 'following' ? 'active' : ''}`}
                onClick={() => handleTabChange('following')}
              >
                Following
              </button>
            </div>
            <div className="posts">
              {loading && <p>Loading tweets...</p>}
              {error && <p>Error fetching tweets: {error.message}</p>}

              {activeTab === 'foryou' && (
                data && data.tweets && data.tweets.length > 0 ? (
                  data.tweets.map((tweet) => (
                    <div key={tweet.id} className="post">
                      <p>{tweet.content}</p>
                      {tweet.image && (
                        <img
                          src={`http://localhost:5000${tweet.image}`}
                          alt="Tweet Media"
                          className="tweet-media"
                        />
                      )}
                      {tweet.video && (
                        <video
                          src={`http://localhost:5000${tweet.video}`}
                          controls
                          className="tweet-media"
                          style={{ maxWidth: '100%', borderRadius: '10px' }}
                        />
                      )}
                      <span>{formatDate(tweet.createdAt)}</span>
                      <div className="tweet-actions">
                        <button onClick={() => handleLike(tweet.id)}>
                          <FontAwesomeIcon icon={faHeart} color={likedTweets.includes(tweet.id) ? 'red' : 'gray'} />
                          <span>{tweet.likes ? tweet.likes.length : 0}</span>
                        </button>
                        <button>
                          <FontAwesomeIcon icon={faComment} />
                          <span>{tweet.comments ? tweet.comments.length : 0}</span>
                        </button>
                        <textarea
                          value={comments[tweet.id] || ''}
                          onChange={(e) => handleCommentChange(tweet.id, e.target.value)}
                          placeholder="Add a comment..."
                        />
                        <button onClick={() => handleCommentSubmit(tweet.id)}>Post</button>
                        <div className="comment-list">
                          {tweet.comments && tweet.comments.map(comment => (
                            <div key={comment.id} className="comment">
                              {comment.content}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No tweets available.</p>
                )
              )}

              {activeTab === 'following' && users.length > 0 ? (
                users.map((user) => (
                  <div key={user._id} className="user-card">
                    <span>{user.username}</span>
                    <button onClick={() => handleFollow(user._id)}>Follow</button>
                  </div>
                ))
              ) : (
                <p>No users found.</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal for posting tweets */}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <PostTweet onClose={() => setIsModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
};

export default MainPage;
