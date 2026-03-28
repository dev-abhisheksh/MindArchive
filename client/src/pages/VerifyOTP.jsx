import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { KeyRound, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { verifyOTP } from '../api/auth.api';

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      // Redirect to register if somehow we landed here without an email
      navigate('/register');
    }
  }, [email, navigate]);

  const handleChange = (e) => {
    setOtp(e.target.value);
    if (error) setError(""); 
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!otp || otp.length < 6) {
      return setError("Please enter a valid OTP");
    }

    setLoading(true);
    try {
      await verifyOTP({ email, otp });
      navigate("/"); // Successful verification redirects to login
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center p-6 bg-slate-50">
      {/* Background Blurs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-5%] right-[-5%] w-[35%] h-[35%] rounded-full bg-blue-50/60 blur-[100px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[35%] h-[35%] rounded-full bg-indigo-50/60 blur-[100px]" />
      </div>

      <div className="w-full max-w-[480px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white mb-4 shadow-xl shadow-indigo-100">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Verify Email</h1>
          <p className="text-slate-500 mt-2">We've sent an OTP to {email}</p>
        </div>

        <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-8 md:p-10">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">One Time Password</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="otp"
                  type="text"
                  placeholder="Enter 6 digit OTP"
                  value={otp}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-slate-900 tracking-[0.2em] font-medium"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative flex items-center justify-center py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-indigo-200 active:scale-[0.98] disabled:opacity-70 mt-4"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Verify Account</span>
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
