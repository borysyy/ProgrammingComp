import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/ui/Header'
import Submissions from './components/pages/Team/Submissions'
import Login from './components/pages/Login/Login'
import Logout from './components/pages/Login/Logout'
import CreateAccount from './components/pages/Login/CreateAccount'
import RegisterTeam from './components/pages/Login/RegisterTeam'

const App = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/user')
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const userData = await response.json()
        setUser(userData)
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <Router>
      <div>
        <Header user={user ? user : 'Guest'} />
        <Routes>
          <Route
            path="/"
            element={<Submissions user={user ? user.username : 'Guest'} />}
          />
          <Route path="/CreateAccount" element={<CreateAccount />} />
          <Route path="/RegisterTeam" element={<RegisterTeam />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
