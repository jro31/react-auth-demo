import React, { useState, useEffect, useCallback } from 'react';

let logoutTimer;

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

const retrieveStoredToken = () => {
  const storedToken = localStorage.getItem('token');
  const storedExpirationDate = localStorage.getItem('expirationTime');

  const remainingTime = calculateRemainingTime(storedExpirationDate);

  // If 'remainingTime' is less than one minute
  if (remainingTime <= 60000) {
    localStorage.removeItem('token');
    localStorage.removeItem('expirationTime');
    return null;
  }

  return {
    token: storedToken,
    duration: remainingTime,
  };
};

export const AuthContextProvider = props => {
  const tokenData = retrieveStoredToken();
  let initialToken; // Sets 'initialToken' as undefined
  if (tokenData) {
    initialToken = tokenData.token;
  }

  const [token, setToken] = useState(initialToken);

  const userIsLoggedIn = !!token;

  // We add useCallback, because adding 'logoutHandler' as a dependency for 'useEffect()' (below), we would otherwise create an infinite loop
  const logoutHandler = useCallback(() => {
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('expirationTime');

    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
  }, []);
  // We don't need any dependencies because 'localStorage' and 'clearTimeout' are browser (not React) functions,
  // 'setToken' is a state-updating function (which we never need to add)
  // and 'logoutTimer' is a global variable which is outside of the React rendering flow, so doesn't need to be added

  const loginHandler = (token, expirationTime) => {
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('expirationTime', expirationTime); // 'expirationTime' has to be a string, hence why we pass it as such ('expirationTime.toISOString()') from 'AuthForm.js'

    const remainingTime = calculateRemainingTime(expirationTime);

    logoutTimer = setTimeout(logoutHandler, remainingTime);
  };

  // This effect sets the logoutTimer if we automatically logged-in the user (if they come back to the app, or reload the page)
  // 'tokenData' is set when this 'AuthContextProvider' component is first rendered (which we only do in 'index.js'), so I assume (I'm guessing) that only happens when the app first loads
  // It is set by calling 'retrieveStoredToken' above, which returns 'null' if the 'expirationTime' in local storage has (or is about to) expire
  // If that's not the case, 'tokenData.duration' is the remaining time until the token expires, and we start a timer to call the 'logoutHandler' with this time remaining
  useEffect(() => {
    if (tokenData) {
      logoutTimer = setTimeout(logoutHandler, tokenData.duration);
    }
  }, [tokenData, logoutHandler]); // 'tokenData' should only change initially

  const contextValue = {
    token: token,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler,
  };

  return <AuthContext.Provider value={contextValue}>{props.children}</AuthContext.Provider>;
};

export default AuthContext;
