import React, { useState } from 'react'
import { login } from '../api/auth.api'
import { useNavigate } from 'react-router-dom'
// Optional: Install lucide-react for modern icons: npm install lucide-react
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react'

const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const loginUser = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await login({ email, password })
            localStorage.setItem("token", res.data.token)
            navigate("/")
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center p-4">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-50/50 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-50/50 blur-[120px]" />
            </div>

            <div className="w-full max-w-[440px]">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-200">
                        <Lock size={24} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-950 tracking-tight">Welcome back</h1>
                    <p className="text-slate-500 mt-2">Enter your credentials to access your account</p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] p-8 md:p-10">
                    <form onSubmit={loginUser} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 outline-none text-slate-900 placeholder:text-slate-400"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-semibold text-slate-700">Password</label>
                                <button type="button" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Forgot?</button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 outline-none text-slate-900 placeholder:text-slate-400"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button (Yours) */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group relative flex items-center justify-center py-4 px-6 bg-slate-950 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all duration-300 transform active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>Sign in</span>
                                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                                </>
                            )}
                        </button>

                        {/* Navigation to Register */}
                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                            <p className="text-slate-500 text-sm font-medium">
                                New here?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate("/register")}
                                    className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors underline-offset-4 hover:underline"
                                >
                                    Create an account
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login