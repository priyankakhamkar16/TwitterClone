import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client'; // Import ApolloProvider
import client from './ApolloClient'; // Import your Apollo Client
import Home from './components/Home';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import MainPage from './components/MainPage';
import PostTweet from './components/PostTweet'; 
import Profile from './components/Profile';

function App() {
  return (
    <ApolloProvider client={client}> {/* Wrap your app with ApolloProvider */}
      <Router>
        <Routes>
          <Route path="/" element={<Home />} /> {/* Home Route */}
          <Route path="/signin" element={<SignIn />} /> {/* SignIn Route */}
          <Route path="/signup" element={<SignUp />} /> {/* SignUp Route */}
          <Route path="/main" element={<MainPage />} /> {/* Main Page Route */}
          <Route path="/posttweet" element={<PostTweet />} /> {/* Route for posting a tweet */}
          <Route path="/profile" element={<Profile />} /> {/* Profile Route */}
        </Routes>
      </Router>
    </ApolloProvider>
  );
}

export default App;
