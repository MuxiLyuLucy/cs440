import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = (props) => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [usernameError, setUsernameError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    
    const navigate = useNavigate();
        
    const onButtonClick = () => {

        // Set initial error values to empty
        setUsernameError("")
        setPasswordError("")

        // Check if the user has entered both fields correctly
        if ("" === username) {
            setUsernameError("Please enter your username")
            return
        }

        if ("" === password) {
            setPasswordError("Please enter a password")
            return
        }

        // Check if username has an account associated with it
        checkAccountExists(username)
            .then(accountExists => {
                if (accountExists) {
                    logIn();
                } else {
                    window.alert("An account does not exist with this username address: " + username)
                }
            })
            .catch(error => {
                console.error('Error checking account:', error);
                // Handle the error, show a message to the user, or perform other actions
            });
    }

    // Call the server API to check if the given username ID already exists
    const checkAccountExists = (username) => {
        return fetch("http://localhost:5001/check-account", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            return data.userExists; // Assuming the response contains a boolean indicating if the user exists
        })
        .catch(error => {
            console.error('Error:', error);
            throw new Error('Failed to check account');
        });
    };

    // Log in a user using username and password
    const logIn = () => {
        fetch("http://localhost:5001/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.message === "Invalid username or password") {
                window.alert("Invalid username or password");
            } else {
                window.alert("Logged in as " + username);
            }
        })
        .catch(error => {
            window.alert("Failed to log in");
        });
    };
    

    return <div className={"mainContainer"}>
        <div className={"titleContainer"}>
            <div>Login</div>
        </div>
        <br />
        <div className={"inputContainer"}>
            <input
                value={username}
                placeholder="Enter your username here"
                onChange={ev => setUsername(ev.target.value)}
                className={"inputBox"} />
            <label className="errorLabel">{usernameError}</label>
        </div>
        <br />
        <div className={"inputContainer"}>
            <input
                value={password}
                placeholder="Enter your password here"
                onChange={ev => setPassword(ev.target.value)}
                className={"inputBox"} />
            <label className="errorLabel">{passwordError}</label>
        </div>
        <br />
        <div className={"inputContainer"}>
            <input
                className={"inputButton"}
                type="button"
                onClick={onButtonClick}
                value={"Log in"} />
        </div>
    </div>
}

export default Login