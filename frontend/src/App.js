import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/ui/Header'
import Home from './components/pages/Home'

const App = () => {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/education" element={<Education />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/contact" element={<Contact />} /> */}
        </Routes>
      </div>
    </Router>
  )
}

export default App
