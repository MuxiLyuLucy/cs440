import React, { useState } from "react";

const Login = (props) => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [usernameError, setUsernameError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [dangerousInputs, setDangerousInputs] = useState([])
    
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

        logIn();

        // // Check if username has an account associated with it
        // checkAccountExists(username)
        //     .then(accountExists => {
        //         if (accountExists) {
        //             logIn();
        //         } else {
        //             window.alert("An account does not exist with this username address: " + username)
        //         }
        //     })
        //     .catch(error => {
        //         console.error('Error checking account:', error);
        //         // Handle the error, show a message to the user, or perform other actions
        //     });
    }

    // Log in a user using username and password
    const logIn = () => {
        // keyword detection 
        if (keywordDetection(username, password)) {
            console.log('keyword detected before gpt call')
            return window.alert("Possible NoSQL attack detected");
        }
        // lookup in cache 
        if (dangerousInputs.includes(username) || dangerousInputs.includes(password)) {
            console.log('dangerous input detected in cache before gpt call')
            return window.alert("Possible NoSQL attack detected");
        }
        fetch("http://localhost:5001/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => {
            if (response.status === 403) {
                setDangerousInputs([...dangerousInputs, username, password])
                window.alert("Possible NoSQL attack detected");
            } else if (response.status === 404) {
                window.alert("Invalid username or password");
            } else if (response.status === 200) {
                window.alert("Logged in as " + username);
            } else {
                window.alert("Something went wrong");
            }
        })
        .catch(error => {
            window.alert("Something went wrong");
        });
    };

    const keywordDetection = (username, password) => {
        const keywords = ['$where', '$regex', '$ne']
        for (let i = 0; i < keywords.length; i++) {
            if (username.includes(keywords[i]) || password.includes(keywords[i])) {
                return true; 
            }
        }
        return false;
    }
    

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