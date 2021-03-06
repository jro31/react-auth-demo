import { useState, useRef, useContext } from 'react';
import { useHistory } from 'react-router-dom';

import AuthContext from '../../store/auth-context';
import classes from './AuthForm.module.css';

const AuthForm = () => {
  const history = useHistory();
  const emailInputRef = useRef();
  const passwordInputRef = useRef();

  const authCtx = useContext(AuthContext);

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const switchAuthModeHandler = () => {
    setIsLogin(prevState => !prevState);
  };

  const submitHandler = event => {
    event.preventDefault();

    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;

    // Optionally add email/password valdations here

    setIsLoading(true);

    let url;

    if (isLogin) {
      url =
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBDiV-nsKVs1Cw4vjJBmMEnqjvBBrpTZco';
    } else {
      url =
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBDiV-nsKVs1Cw4vjJBmMEnqjvBBrpTZco';
    }

    fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        email: enteredEmail,
        password: enteredPassword,
        returnSecureToken: true,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        setIsLoading(false);
        if (res.ok) {
          return res.json();
        } else {
          return res.json().then(data => {
            let errorMessage = 'Authentication failed!';
            if (data && data.error && data.error.message) {
              errorMessage = data.error.message; // You'd want to parse this error message somehow; it's not entirely humanized here, but it'll do for this demo
            }
            throw new Error(errorMessage);
          });
        }
      })
      .then(data => {
        const expirationTime = new Date(new Date().getTime() + +data.expiresIn * 1000); // 'expiresIn' is returned from the Firebase API, and is the number of seconds, as a string, until the 'idToken' expires
        // This line converts that into the time, as a date object, when the 'idToken' expires and sets it to 'expirationTime'
        // The '+' in front of '+data.expiresIn' converts it from a string to a number, then the '* 1000' converts it to milliseconds.
        // It is then added onto the current time in milliseconds ('new Date().getTime()')

        authCtx.login(data.idToken, expirationTime.toISOString()); // 'toISOString()' converts it to a string (because we convert it to a date object in 'calculateRemainingTime' in 'auth-context.js')
        history.replace('/');
      })
      .catch(err => {
        alert(err.message);
      });
  };

  return (
    <section className={classes.auth}>
      <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
      <form onSubmit={submitHandler}>
        <div className={classes.control}>
          <label htmlFor='email'>Your Email</label>
          <input type='email' id='email' required ref={emailInputRef} />
        </div>
        <div className={classes.control}>
          <label htmlFor='password'>Your Password</label>
          <input type='password' id='password' required ref={passwordInputRef} />
        </div>
        <div className={classes.actions}>
          {!isLoading && <button>{isLogin ? 'Login' : 'Create Account'}</button>}
          {isLoading && <p>Sending request...</p>}
          <button type='button' className={classes.toggle} onClick={switchAuthModeHandler}>
            {isLogin ? 'Create new account' : 'Login with existing account'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AuthForm;
