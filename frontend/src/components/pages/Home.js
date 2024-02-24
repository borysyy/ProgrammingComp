import React, { useEffect } from 'react'

const Home = () => {
  const handleFormSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    console.log('Form data:', formData)

    fetchFormData(formData)
  }

  const fetchFormData = (formData) => {
    fetch('http://localhost:3000/server/execute', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then((data) => {
        console.log('Response data:', data) // Log the response data

        document.getElementById('compilerOutput').innerText =
          data.compilerOutput
        document.getElementById('programOutput').innerText = data.programOutput
        document.getElementById('programErrors').innerText = data.programErrors
      })
      .catch((error) => {
        console.error('An error occurred:', error)
      })
  }

  // useEffect(() => {
  //   const script = document.createElement('script')
  //   script.innerHTML = document
  //     .getElementById('code-form')
  //     .addEventListener('submit', function (event) {
  //       event.preventDefault()
  //       const formData = new FormData(document.getElementById('code-form'))
  //       fetchFormData(formData)
  //     })
  //   document.body.appendChild(script)

  //   return () => {
  //     document.body.removeChild(script)
  //   }
  // }, [])

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
        {/* Username input */}
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Username:
          </label>
          <input
            type="text"
            name="username"
            id="username"
            className="form-control"
          />
        </div>

        {/* File input */}
        <div className="mb-3">
          <label htmlFor="file" className="form-label">
            File:
          </label>
          {/* <input type="file" name="file" id="file" className="form-control" /> */}
          <input type="file" name="files" id="file" className="form-control" multiple />
        </div>

        {/* Submit button */}
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>

      {/* Code Execution Results */}
      <div className="mt-4">
        <h2>Code Execution Results:</h2>
        <div className="container mt-4">
          <div className="row">
            <div className="col-md-4">
              <h3 className="mb-0 text-center">Compiler Output:</h3>
              <pre id="compilerOutput" style={{ whiteSpace: 'pre-wrap' }}></pre>
            </div>
            <div className="col-md-4">
              <h3 className="mb-0 text-center">Program Output:</h3>
              <pre id="programOutput" style={{ whiteSpace: 'pre-wrap' }}></pre>
            </div>
            <div className="col-md-4">
              <h3 className="mb-0 text-center">Program Error:</h3>
              <pre id="programErrors" style={{ whiteSpace: 'pre-wrap' }}></pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
