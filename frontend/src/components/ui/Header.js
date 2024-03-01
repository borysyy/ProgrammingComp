import React from 'react'
import Navigation from './Navigation'

const Header = ({ user }) => {
  const isLoggedIn = user.email != undefined ? true : false
  console.log(isLoggedIn)
  return (
    <div className="bg-primary">
      <div className="container-fluid">
        <div className="row">
          <div className="col-4">
            <h1 className="display-4">SUNY Poly Programming Comp</h1>
            <div>
              <Navigation logInStatus={isLoggedIn} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
