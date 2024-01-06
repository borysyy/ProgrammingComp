import React, { useEffect } from 'react';

const Home = () => {
  const handleFormSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    fetchFormData(formData);
  };

  const fetchFormData = (formData) => {
    fetch('http://localhost:3000/execute', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        document.getElementById('output').innerText = data.output;
      })
      .catch((error) => {
        document.getElementById('output').innerText = 'An error occurred: ' + error.message;
      });
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.innerHTML = `
      document.getElementById('code-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(document.getElementById('code-form'));
        fetchFormData(formData);
      });
    `;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="container text-center mt-4">
      <h1>Upload and Execute Code</h1>
      <form
        action="/execute"
        method="post"
        encType="multipart/form-data"
        id="code-form"
        onSubmit={handleFormSubmit}
      >
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Username:
          </label>
          <input type="text" name="username" id="username" className="form-control" />
        </div>
        <div className="mb-3">
          <label htmlFor="file" className="form-label">
            File:
          </label>
          <input type="file" name="file" id="file" className="form-control" />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>

      <div className="mt-4">
        <h2>Code Execution Results</h2>
        <pre id="output" style={{ whiteSpace: 'pre-wrap' }}></pre>
      </div>
    </div>
  );
};

export default Home;
