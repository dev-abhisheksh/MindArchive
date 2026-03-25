import React, { useState, useRef } from 'react'
import { verifyPin } from '../api/vault.api'
import { useNavigate } from 'react-router-dom'

const VerifyPin = () => {
    const [pin, setPin] = useState(["", "", "", ""])
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const inputsRef = useRef([])
    const navigate = useNavigate()

    const handleChange = (value, index) => {
        if (!/^\d?$/.test(value)) return

        const newPin = [...pin]
        newPin[index] = value
        setPin(newPin)

        if (value && index < 3) {
            inputsRef.current[index + 1].focus()
        }
    }

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !pin[index] && index > 0) {
            inputsRef.current[index - 1].focus()
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const finalPin = pin.join("")

        try {
            setLoading(true)
            await verifyPin(finalPin)

            sessionStorage.setItem("vaultVerified", "true")
            navigate('/vault', { replace: true })
        } catch (err) {
            setError("Wrong PIN ❌")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="h-full flex items-center justify-center bg-gray-100">

            <div className="bg-white p-8 rounded-2xl shadow-md w-80 text-center border border-gray-200">

                <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    🔒 Enter Vault PIN
                </h2>

                <form onSubmit={handleSubmit}>

                    <div className="flex justify-between mb-6">
                        {pin.map((digit, index) => (
                            <input
                                key={index}
                                type="password"
                                maxLength="1"
                                value={digit}
                                ref={(el) => (inputsRef.current[index] = el)}
                                onChange={(e) => handleChange(e.target.value, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                disabled={loading}
                                className="w-12 h-12 text-xl text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-100"
                            />
                        ))}
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm mb-3">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Verifying...
                            </>
                        ) : (
                            "Verify"
                        )}
                    </button>
                </form>

            </div>
        </div>
    )
}

export default VerifyPin