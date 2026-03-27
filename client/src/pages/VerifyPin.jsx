import React, { useState, useRef, useEffect } from 'react'
import { verifyPin, checkVaultPin, setVaultPin } from '../api/vault.api'
import { useNavigate } from 'react-router-dom'
import { Lock, Loader2, KeyRound } from 'lucide-react'

const VerifyPin = () => {
    const [pin, setPin] = useState(["", "", "", ""])
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    
    // Modes: 'checking', 'verify', 'create', 'confirm'
    const [mode, setMode] = useState('checking')
    const [tempPin, setTempPin] = useState("") 

    const inputsRef = useRef([])
    const navigate = useNavigate()

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await checkVaultPin()
                if (res.data.hasPin) {
                    setMode('verify')
                } else {
                    setMode('create')
                }
            } catch (err) {
                console.error("Failed to check PIN status", err)
                setError("Failed to check Vault status")
                setMode('verify') 
            }
        }
        checkStatus();
    }, [])

    const handleChange = (value, index) => {
        if (!/^\d?$/.test(value)) return

        const newPin = [...pin]
        newPin[index] = value
        setPin(newPin)
        setError("")

        if (value && index < 3) {
            inputsRef.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !pin[index] && index > 0) {
            inputsRef.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4)
        if (pasted.length === 4) {
            const newPin = pasted.split("")
            setPin(newPin)
            inputsRef.current[3]?.focus()
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

            if (mode === 'verify') {
                await verifyPin(finalPin)
                sessionStorage.setItem("vaultVerified", "true")
                navigate('/vault', { replace: true })
                
            } else if (mode === 'create') {
                setTempPin(finalPin)
                setPin(["", "", "", ""])
                setMode('confirm')
                inputsRef.current[0]?.focus()
                
            } else if (mode === 'confirm') {
                if (finalPin === tempPin) {
                    await setVaultPin(finalPin)
                    sessionStorage.setItem("vaultVerified", "true")
                    navigate('/vault', { replace: true })
                } else {
                    setError("PINs do not match. Try again.")
                    setPin(["", "", "", ""])
                    setTempPin("")
                    setMode('create')
                    inputsRef.current[0]?.focus()
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred")
            setPin(["", "", "", ""])
            if (mode === 'verify') inputsRef.current[0]?.focus()
        } finally {
            setLoading(false)
        }
    }

    const getTitle = () => {
        if (mode === 'checking') return "Loading..."
        if (mode === 'create') return "Create PIN"
        if (mode === 'confirm') return "Confirm PIN"
        return "Private Vault"
    }

    const getSubtitle = () => {
        if (mode === 'checking') return "Checking vault status..."
        if (mode === 'create') return "Set a 4-digit PIN to secure your vault"
        if (mode === 'confirm') return "Re-enter your 4-digit PIN to confirm"
        return "Enter your 4-digit PIN to continue"
    }
    
    const getButtonText = () => {
        if (loading) return mode === 'verify' ? "Verifying..." : "Saving..."
        if (mode === 'create') return "Continue"
        if (mode === 'confirm') return "Save PIN"
        return "Unlock Vault"
    }

    return (
        <div className="h-full flex items-center justify-center bg-bg-secondary">
            <div className="bg-bg-card p-8 rounded-2xl shadow-md w-80 text-center border border-border-theme">
                <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-2xl bg-accent-light">
                        {mode === 'create' || mode === 'confirm' ? (
                            <KeyRound size={28} className="text-accent-text" />
                        ) : (
                            <Lock size={28} className="text-accent-text" />
                        )}
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-1 text-text-primary">
                    {getTitle()}
                </h2>
                <p className="text-text-muted text-sm mb-6">
                    {getSubtitle()}
                </p>

                {mode === 'checking' ? (
                    <div className="flex justify-center py-8">
                        <Loader2 size={32} className="animate-spin text-accent-primary" />
                    </div>
                ) : (
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
                                    {getButtonText()}
                                </>
                            ) : (
                                <>
                                    {mode === 'create' || mode === 'confirm' ? <KeyRound size={16} /> : <Lock size={16} />}
                                    {getButtonText()}
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}

export default VerifyPin