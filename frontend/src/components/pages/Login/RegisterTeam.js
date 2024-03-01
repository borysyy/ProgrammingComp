import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const RegisterTeam = () => {
  const URL = 'http://localhost:3000/server/RegisterTeam/register'
  const nav = useNavigate()
  const navToHome = () => {
    nav('/')
  }

  const [teamMember, setTeamMember] = useState([{ email: '' }])

  const [teamName, setTeamName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleFormChange = (index, event) => {
    let data = [...teamMember]
    data[index][event.target.name] = event.target.value
    setTeamMember(data)
  }
  const addFields = () => {
    let newField = { email: '' }
    setTeamMember([...teamMember, newField])
  }

  const removeFields = (index) => {
    let data = [...teamMember]
    data.splice(-1)
    setTeamMember(data)
  }

  const submit = (e) => {
    e.preventDefault()
    fetch(URL, {
      method: 'post',
      body: JSON.stringify({
        teamName: teamName,
        teamMember: teamMember,
      }),
      headers: { 'Content-Type': 'application/json' },
    }).then((response) => {
      console.log('STATUS ' + response.status)
      if (response.status === 200) {
        navToHome()
      } else if (response.status === 401) {
        setErrorMsg('Unable to register team')
      }
    })
  }

  return (
    <div className="container text-center">
      <h1> Register Team </h1>
      <div>{errorMsg}</div>
      <form className="d-flex flex-column justify-contents-center align-items-center">
        <input
          className="form-control mb-3"
          name="teamName"
          type="text"
          placeholder="Team Name"
          onChange={(e) => setTeamName(e.target.value)}
          style={{ width: '250px' }}
        />

        {teamMember.map((input, index) => {
          return (
            <div key={index}>
              <input
                className="form-control mb-3"
                name="email"
                type="text"
                placeholder="Email"
                onChange={(event) => handleFormChange(index, event)}
                style={{ width: '250px' }}
              />
            </div>
          )
        })}
      </form>
      <input
        className="btn btn-success"
        name="addField"
        type="button"
        value="Add Team Member"
        onClick={addFields}
      />
      <input
        className="btn btn-danger"
        name="removeField"
        type="button"
        value="Remove Member"
        onClick={removeFields}
      />
      <input
        className="btn btn-primary"
        name="submit"
        type="submit"
        value="Submit Team"
        onClick={submit}
      />
    </div>
  )
}

export default RegisterTeam
