import React, { useState } from 'react'

// useState - Storing variables that are part of your application's state and will change as the user interacts with your website.
// UseEffect - Perform side effects when certain changes occur in state

const Home = () => {
  const [results, setResults] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleFormSubmit = (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setIsLoading(true)
    const formData = new FormData(event.target)
    console.log('Form data:', formData)

    fetchFormData(formData)
    // Re-enable the button after 5 seconds
    setTimeout(() => {
      setIsSubmitting(false)
    }, 5000)
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

        const username = formData.get('username')

        // Update the results state with the new data
        setResults((prevResults) => ({
          ...prevResults,
          [username]: data,
        }))
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('An error occurred:', error)
        setIsLoading(false)
      })
  }

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
          <input type="file" name="file" id="file" className="form-control" />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      {/* Code Execution Results */}
      <div className="mt-4">
        <h2>Code Execution Results:</h2>
        <div className="container mt-4">
          {/* Map over the results and create a new div for each user */}
          {Object.entries(results).map(([username, result]) => (
            <div key={username}>
              <h3>{username}</h3>
              <div className="container">
                <div className="row">
                  <div className="col">
                    <div>Compiler Output:</div>
                    <div>{result.compilerOutput}</div>
                  </div>
                  <div className="col">
                    <div>Program Output:</div>
                    <div>{result.programOutput}</div>
                  </div>
                  <div className="col">
                    <div>Program Errors:</div>
                    <div>{result.programErrors}</div>
                  </div>
                  <div className="col">
                    <div>Compile/Runtime Status:</div>
                    <div>{result.compileStatus}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
