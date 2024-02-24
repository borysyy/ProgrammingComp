import React from 'react'
import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'

function Navigation({logInStatus}) {
  const logInOrOut = logInStatus ? "Logout" : "Login";

  return (
    <Navbar expand="lg" className="bg-primary">
      <Container>
        <Navbar.Brand>Welcome!</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
			{logInStatus ? <Nav.Link as={Link} to="/RegisterTeam"> Register Team </Nav.Link> : null}
            <Nav.Link as={Link} to={"/" + logInOrOut}>
              { logInOrOut }
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Navigation
