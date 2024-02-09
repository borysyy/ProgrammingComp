import React, { useEffect, useState } from 'react';

const CreateAccount = () => {
    const URL = "http://localhost:3001/CreateAccount/register";
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmedPassword, setConfirmedPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const registerAccount = () =>{
        try{
            if (password !== confirmedPassword){
                setPasswordError("Passwords do not match, please recheck your passwords.");
            }
            else {
                const response = fetch(URL, {
                    method:'post',
                    body: JSON.stringify({
                        email: email,
                        username: username,
                        password: password,
                        confirmed: 'TRUE',
                    })
                }).then(respose => console.log(response.status));
            }
            if (response.status === 400){
                setEmailError(response.message);
            }
            else{
                setEmailError("Good shit brother");
            }
        }
        catch (e){
            console.log("error: " + e);
        }
    };
    return (
    <div className="container text-center">
        <h1> Login </h1>
        <form className="d-flex flex-column justify-contents-center align-items-center">
       <div className="input-group mb-3" style={{width:"33%"}}>
            <input type="email" 
            name="email" 
            placeholder="Email" 
            id="email" 
            className="form-control"
            onChange={e => setEmail(e.target.value)}/>
            <label htmlFor="email">{ emailError } </label>
       </div>
	   <div className="input-group mb-3" style={{width:"33%"}}>
            <input type="text" name="username" 
            placeholder="Username" 
            id="username" 
            className="form-control"
            onChange={e => setUsername(e.target.value)}/>
        </div>
        <div className="input-group mb-3" style={{width:"33%"}} >
            <input type="password" 
            name="password" 
            placeholder="Password" 
            id="password" 
            className="form-control"
            onChange={e => setPassword(e.target.value)}/>
        </div>
		<div className="input-group mb-3" style={{width:"33%"}} >
			<input type="password" 
            name="password_confirm" 
            placeholder="Confirm password" 
            id="confirmedPassword" 
            className="form-control"
            onChange={e => setConfirmedPassword(e.target.value)}/>
            <label htmlFor="password_confirm"> { passwordError} </label>
		</div>  
            <div className="d-flex" style={{gap:"15px"}}>
                <input type="button" 
                className="btn btn-primary"
                id="submitBtn"
                value="Create Account"
                onClick={ registerAccount }/>
            </div> 
        </form>
    </div>
  );
};

export default CreateAccount;
