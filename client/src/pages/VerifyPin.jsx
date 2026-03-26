import React, { useState, useRef } from 'react'
import { verifyPin } from '../api/vault.api'
import { useNavigate } from 'react-router-dom'
import { Lock, Loader2 } from 'lucide-react'

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
        setError("")

        if (value && index < 3) {
            inputsRef.current[index + 1].focus()
        }
    }

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !pin[index] && index > 0) {
            inputsRef.current[index - 1].focus()
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4)
        if (pasted.length === 4) {
            const newPin = pasted.split("")
            setPin(newPin)
            inputsRef.current[3].focus()
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const finalPin = pin.join("")
        if (finalPin.length < 4) {
            setError("Enter all 4 digits")
            return
        }

        try {
            setLoading(true)
            await verifyPin(finalPin)
            sessionStorage.setItem("vaultVerified", "true")
            navigate('/vault', { replace: true })
        } catch (err) {
            setError(err.response?.data?.message || "Wrong PIN")
            setPin(["", "", "", ""])
            inputsRef.current[0].focus()
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="h-full flex items-center justify-center bg-bg-secondary">
            <div className="bg-bg-card p-8 rounded-2xl shadow-md w-80 text-center border border-border-theme">
                <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-2xl bg-accent-light">
                        <Lock size={28} className="text-accent-text" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-1 text-text-primary">
                    Private Vault
                </h2>
                <p className="text-text-muted text-sm mb-6">
                    Enter your 4-digit PIN to continue
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
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
                                className="w-12 h-14 text-xl text-center font-bold border border-border-theme rounded-xl bg-bg-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary disabled:opacity-50 transition-all"
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="flex items-center justify-center gap-1.5 mb-4 text-red-500 text-sm font-medium">
                            <span>❌</span> {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || pin.some(d => d === "")}
                        className="w-full bg-accent-primary hover:opacity-90 text-white py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                <Lock size={16} />
                                Unlock Vault
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default VerifyPin