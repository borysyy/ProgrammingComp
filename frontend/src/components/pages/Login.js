import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
	const URL = "http://localhost:3000/server/Login/auth"
    const createAccountNav = useNavigate();
	const navToCreateAccount = () =>{
		createAccountNav("/CreateAccount");
	}
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const verify = () =>{
        fetch(URL, {
            method:'post',
            body: JSON.stringify({
                email: email,
                password: password,
            }), headers: { "Content-Type": "application/json"},
        }).then((response) => {
            console.log("STATUS " + response.status)
            if (response.status === 200){
                setErrorMsg("Log In Successful");
            }
            else if (response.status === 401){
                setErrorMsg("Incorrect Email or Password");
            }
        });
    };

return (
    <div className="container text-center">
        <h1> Login </h1>
        <div> {errorMsg} </div>
        <form className="d-flex flex-column justify-contents-center align-items-center">
        <div className="input-group mb-3" style={{width:"33%"}}>
            <input type="text" 
            name="email" 
            placeholder="Email" 
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