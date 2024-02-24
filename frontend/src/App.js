import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/ui/Header'
import Home from './components/pages/Home'
import Login from './components/pages/Login'
import Logout from './components/pages/Logout'
import CreateAccount from './components/pages/CreateAccount'
import RegisterTeam from  './components/pages/RegisterTeam'
import { CookiesProvider, useCookies } from "react-cookie"

const App = () => {
  const [cookie, setCookie, removeCookie] = useCookies(['user']);

  const onLogin = (email) =>{
      setCookie('user', email, {path : "/"});
  }

  const onLogout = () => {
  	removeCookie('user', {path : "/"});
  }

  return (
    <CookiesProvider>
    <Router>
      <div>
        <Header user={cookie.user ? cookie.user : "Guest"}/>
        <Routes>
          <Route path="/" element={<Home user={cookie.user ? cookie.user : "Guest"}/>} />
          <Route path="/Login" element={<Login onLogin={onLogin}/>} />
		  <Route path="/CreateAccount" element={<CreateAccount />} />	
          <Route path="/Logout" element={<Logout onLogout={onLogout}/>} />
		  <Route path="/RegisterTeam" element={<RegisterTeam />} />
	{/* <Route path="/education" element={<Education />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/contact" element={<Contact />} /> */}
        </Routes>
      </div>
    </Router>
    </CookiesProvider>
  )
}

export default App
