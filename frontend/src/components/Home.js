import React, { useState } from 'react';
import '../styles/Home.css';
import SignUp from './SignUp';
import SignIn from './SignIn';

const Home = () => {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const openSignUpModal = () => {
    setIsSignUpOpen(true);
  };

  const closeSignUpModal = () => {
    setIsSignUpOpen(false);
  };

  const openSignInModal = () => {
    setIsSignInOpen(true);
  };

  const closeSignInModal = () => {
    setIsSignInOpen(false);
  };

  return (
    <div className="home">
      <div className="left-content">
        <img 
          src={require('../assets/images/TwitterLogo3.jpg')} 
          alt="Twitter Logo" 
          className="twitter-logo" 
        />
      </div>
      <div className="right-content">
        <h1>Happening now</h1>
        <h2>Join today.</h2>
        <div className="auth-buttons">
          <button className="btn signup-btn" onClick={openSignUpModal}>Create Account</button>
          <button className="btn signin-btn" onClick={openSignInModal}>Sign in</button>
        </div>
      </div>

      <SignUp isOpen={isSignUpOpen} closeModal={closeSignUpModal} />
      <SignIn isOpen={isSignInOpen} closeModal={closeSignInModal} />
    </div>
  );
};

export default Home;
