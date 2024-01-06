import React, { useEffect } from 'react'

const Home = () => {

  useEffect(() => {
    // The script you want to integrate
    const script = document.createElement('script');
    script.innerHTML = `
        document.getElementById('code-form').addEventListener('submit', function (event) {
            event.preventDefault();
            const formData = new FormData(document.getElementById('code-form'));
            fetch('http://localhost:3000/execute', {
                method: 'POST',
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('output').innerText = data.output;
            })
            .catch(error => {
                document.getElementById('output').innerText = 'An error occurred: ' + error.message;
            });
        });
    `;
    document.body.appendChild(script);

    return () => {
      // Clean up: Remove the script when the component unmounts
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Upload and Execute Code</h1>
      <form action="/execute" method="post" encType="multipart/form-data" id="code-form">
        <label htmlFor="username">Username:</label>
        <input type="text" name="username" id="username" />
        <br />
        <label htmlFor="file">File:</label>
        <input type="file" name="file" id="file" />
        <br />
        <input type="submit" value="Submit" />
      </form>
    
      <div style={{ textAlign: 'center' }}>
        <h2>Code Execution Results</h2>
        <pre id="output" style={{ whiteSpace: 'pre-wrap' }}></pre>
      </div>
    </div>
  );
};

export default Home
