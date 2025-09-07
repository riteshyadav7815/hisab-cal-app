import React, { useState } from 'react';
import './LoginPage.css';

const LoginPage = () => {
    const [isSignUpActive, setIsSignUpActive] = useState(false);

    const handleSignUpClick = () => {
        setIsSignUpActive(true);
    };

    const handleSignInClick = () => {
        setIsSignUpActive(false);
    };

    return (
        <div className="login-page-body">
            <div className={`container ${isSignUpActive ? 'right-panel-active' : ''}`} id="container">
                {/* Sign Up Container */}
                <div className="form-container sign-up-container">
                    <form className="auth-form">
                        <h1>Create Account</h1>
                        <div id="registerError" className="error-message"></div>
                        <input type="text" id="registerUsername" placeholder="Username" autoComplete="username" />
                        <input type="password" id="registerPassword" placeholder="Password" autoComplete="new-password" />
                        <button id="registerButton">Sign Up</button>
                    </form>
                </div>

                {/* Sign In Container */}
                <div className="form-container sign-in-container">
                    <form className="auth-form">
                        <h1>Sign In</h1>
                        <div id="loginError" className="error-message"></div>
                        <input type="text" id="loginUsername" placeholder="Username" autoComplete="username" />
                        <input type="password" id="loginPassword" placeholder="Password" autoComplete="current-password" />
                        <a href="#">Forgot your password?</a>
                        <button id="loginButton">Sign In</button>
                    </form>
                </div>

                {/* Overlay Container */}
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1>Welcome Back!</h1>
                            <p>To keep connected with us please login with your personal info</p>
                            <button className="ghost" id="signIn" onClick={handleSignInClick}>Sign In</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1>Hello, Friend!</h1>
                            <p>Enter your personal details and start your journey with us</p>
                            <button className="ghost" id="signUp" onClick={handleSignUpClick}>Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;