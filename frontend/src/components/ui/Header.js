import React from 'react'
import Navigation from './Navigation'

const Header = () => {
  return (
    <div className="bg-primary">
      <div className="container-fluid">
        <div className="row">
          <div className="col-4">
            <h1 className="display-4">SUNY Poly Programming Comp</h1>
            <div>
              <Navigation />
            </div>
          </div>
          <div className="col-8 d-flex justify-content-end">
            <img
              className="header-img"
              src={require('../../pictures/Poly_pfp.png').default}
              alt="SUNY Poly Logo"
              role="img"
              focusable="false"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
