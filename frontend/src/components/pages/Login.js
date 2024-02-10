import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
	const URL = "http://localhost:3001/Login/auth"
    const createAccountNav = useNavigate();
	const navToCreateAccount = () =>{
		createAccountNav("/CreateAccount");
	}
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const verify = () =>{
        console.log("VERIFYING");
        fetch(URL, {
            method:'post',
            body: JSON.stringify({
                email: email,
                password: password,
            })
        }).then((response) => console.log(response.status));
        console.log("Got the response");
    };

return (
    <div className="container text-center">
        <h1> Login </h1>
        <form className="d-flex flex-column justify-contents-center align-items-center">
        <label htmlFor='email' value={errorMsg}/>
        <div className="input-group mb-3" style={{width:"33%"}}>
            <input type="text" 
            name="email" 
            placeholder="email" 
            className="form-control"
            onChange={e => setEmail(e.target.value)}/>
        </div>
        <div className="input-group mb-3" style={{width:"33%"}} >
            <input type="password" 
            name="password" 
            placeholder="Password" 
            className="form-control"
            onChange={e => setPassword(e.target.value)}/>
        </div>
            <div className="d-flex" style={{gap:"15px"}}>
                <input type="button" className="btn btn-primary" onClick={navToCreateAccount} value="Create Account"/>
                <input type="button" className="btn btn-success" onClick={verify} value="Login"/>
            </div> 
        </form>
    </div>
  );
};

export default Login;