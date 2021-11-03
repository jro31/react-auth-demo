import React, { useState } from 'react';

const AuthContext = React.createContext({
  token: '',
  isLoggedIn: false,
  login: token => {},
  logout: () => {},
});

const calculateRemainingTime = expirationTime => {
  const currentTime = new Date().getTime(); // Returns the current time in milliseconds, for example 'new Date()' returns '2021-11-03T15:37:39.285Z', where as 'new Date().getTime()' returns '1635953866277'
  const adjExpirationTime = new Date(expirationTime).getTime();

  const remainingDuration = adjExpirationTime - currentTime;

  return remainingDuration;
};

export const AuthContextProvider = props => {
  const initialToken = localStorage.getItem('token'); // Will either be the stored token, or will be 'undefined' if the token doesn't exist
  // Note that 'localStorage' is a synchronous API (hence we don't need to use async/await or anything similar)
  const [token, setToken] = useState(initialToken);
  // As the 'initialToken' is only used in the initial state, we won't override any state changes with the token

  const userIsLoggedIn = !!token;

  const logoutHandler = () => {
    setToken(null);
    localStorage.removeItem('token'); // Will remove the 'token' key/value (set above)
    // An alternative to this would be to call 'localStorage.clear()', which erases all local storage for this site
  };

  const loginHandler = (token, expirationTime) => {
    setToken(token);
    localStorage.setItem('token', token); // Side-note: localStorage can only store primitive data. If you want to store an object, for example, you have to convert it to JSON first (which would make it a string)

    const remainingTime = calculateRemainingTime(expirationTime);

    setTimeout(logoutHandler, remainingTime); // Will automatically call 'logoutHandler' and log the user out, once the remaining time expires
  };

  const contextValue = {
    token: token,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler,
  };

  return <AuthContext.Provider value={contextValue}>{props.children}</AuthContext.Provider>;
};

export default AuthContext;
