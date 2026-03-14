import React, { useEffect, useState } from 'react'
import { login } from '../api/auth.api'
import { useNavigate } from 'react-router-dom'

const Login = () => {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const loginUser = async (e) => {
        e.preventDefault()
        const data = { email, password }

        try {
            const res = await login(data)
            localStorage.setItem("token", res.data.token)
            navigate("/")
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div>
            <form onSubmit={loginUser}>
                <input
                    type="text"
                    placeholder='Enter Email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="text"
                    placeholder='Enter Password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type='submit'>Login</button>
            </form>
        </div>
    )
}

export default Login