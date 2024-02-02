import React, { useEffect } from 'react';

const CreateAccount = () => {
  return (
    <div className="container text-center">
        <h1> Login < /h1>
        <form className="d-flex flex-column justify-contents-center align-items-center">
       <div className="input-group mb-3" style={{width:"33%"}}>
            <input type="email" name="email" placeholder="Email" className="form-control"/>
       </div>
	   <div className="input-group mb-3" style={{width:"33%"}}>
            <input type="text" name="username" placeholder="Username" className="form-control"/>
        </div>
        <div className="input-group mb-3" style={{width:"33%"}} >
            <input type="password" name="password" placeholder="Password" className="form-control"/>
        </div>
		<div className="input-group mb-3" style={{width:"33%"}} >
			<input type="password" name="password_confirm" placeholder="Confirm password" className="form-control"/>
		</div>
            <div className="d-flex" style={{gap:"15px"}}>
                <button type="sumbit" className="btn btn-primary"> Create Account </button>
            </div> 
        </form>
    </div>
  );
};

export default CreateAccount;
