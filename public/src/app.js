import React from 'react';
import Navbar from './components/navbar'; // Import the Navbar component

const App = () => {
  return (
    <div className="container-fluid bg-primary">
      <div className="row">
        <div className="col-8">
          <h1 className="display-4">SUNY Poly Programming Competition</h1>
        </div>
      </div>
      <Navbar /> {/* Render the Navbar component */}
      {/* Other components or content */}
    </div>
  );
};

export default App;



