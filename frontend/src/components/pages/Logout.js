import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = ({ onLogout }) => {
    const nav = useNavigate();
    const navToHome = () => {
        nav("/");
    }
	const yesNavToHome = () => {
		onLogout();
		nav("/");
	}

return (
    <div className="container text-center">
        <h1> Confirm Logout? </h1>
		<div className="mb-3">
		 <input style={{width:"150px"}} className="btn btn-success" type="button" value="Yes" onClick={yesNavToHome}/>
		</div >
		<div className="mb-3">
		 <input style={{width:"150px"}} className="btn btn-danger" type="button" value="No" onClick={navToHome}/>
		</div >
	</div >
);
}

export default Logout;
