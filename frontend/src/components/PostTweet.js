import React, { useState, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_TWEET } from '../graphql/mutations'; // Ensure you have this mutation defined
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import '../styles/PostTweet.css';

const PostTweet = ({ onClose }) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null); // State for media
  const [addTweet] = useMutation(ADD_TWEET);
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const fileInputRef = useRef(null); // Reference for hidden file input

  const handleMediaChange = (e) => {
    setMedia(e.target.files[0]); // Get the first file
  };

  const handleIconClick = () => {
    // Trigger the file input click when the icon is clicked
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let mediaUrl = null;

    // Set loading state
    setIsLoading(true);

    // Handle media upload
    if (media) {
      const formData = new FormData();
      formData.append('media', media);

      try {
        const uploadResponse = await fetch('http://localhost:5000/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Media upload failed');
        }

        const uploadResult = await uploadResponse.json();
        mediaUrl = uploadResult.filePath; // Get the URL/path of the uploaded file
      } catch (error) {
        console.error('Error uploading media:', error);
        alert('Failed to upload media. Please try again.'); // Notify user
        setIsLoading(false);
        return;
      }
    }

    // Post the tweet
    try {
      const userId = localStorage.getItem('userId'); // Get user ID
      await addTweet({
        variables: {
          input: {
            content,
            userId,
            image: media && media.type.startsWith('image') ? mediaUrl : null,
            video: media && media.type.startsWith('video') ? mediaUrl : null,
          },
        },
      });

      onClose(); // Close the modal after submitting
    } catch (error) {
      console.error('Error adding tweet:', error);
      alert('Failed to post tweet. Please try again.'); // Notify user
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's happening?"
        required
      />

      <div className="media-upload">
        <FontAwesomeIcon
          icon={faImage}
          size="2x"
          style={{ cursor: 'pointer' }}
          onClick={handleIconClick}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleMediaChange}
          accept="image/*,video/*"
          style={{ display: 'none' }} // Hide the actual file input
        />
        {media && <span>{media.name}</span>} {/* Display selected file name */}
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Posting...' : 'Tweet'}
      </button>
    </form>
  );
};

export default PostTweet;
