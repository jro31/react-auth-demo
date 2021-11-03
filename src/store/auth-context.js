import React, { useState } from 'react';

const AuthContext = React.createContext({
  token: '',
  isLoggedIn: false,
  login: token => {},
  logout: () => {},
});

export const AuthContextProvider = props => {
  const initialToken = localStorage.getItem('token'); // Will either be the stored token, or will be 'undefined' if the token doesn't exist
  // Note that 'localStorage' is a synchronous API (hence we don't need to use async/await or anything similar)
  const [token, setToken] = useState(initialToken);
  // As the 'initialToken' is only used in the initial state, we won't override any state changes with the token

  const userIsLoggedIn = !!token;

  const loginHandler = token => {
    setToken(token);
    localStorage.setItem('token', token); // Side-note: localStorage can only store primitive data. If you want to store an object, for example, you have to convert it to JSON first (which would make it a string)
  };

  const logoutHandler = () => {
    setToken(null);
    localStorage.removeItem('token'); // Will remove the 'token' key/value (set above)
    // An alternative to this would be to call 'localStorage.clear()', which erases all local storage for this site
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
