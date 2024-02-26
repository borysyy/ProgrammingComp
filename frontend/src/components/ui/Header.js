import React from 'react'
import Navigation from './Navigation'

const Header = () => {
  return (
    <div className="bg-primary">
      <div className="container-fluid">
        <div className="row">
          <div className="col-6">
            <h1 className="display-4">SUNY Poly Programming Comp</h1>
            <div>
              <Navigation />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
