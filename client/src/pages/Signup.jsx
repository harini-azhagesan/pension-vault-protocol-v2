import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, User, Mail, Lock, Building, UserCheck } from 'lucide-react';
import api from '../utils/api';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    organization: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/api/auth/register', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        organization: formData.organization.trim()
      });

      if (response?.data?.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
        {/* Animated background lines */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-neon-blue to-transparent animate-pulse" />
            <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-neon-purple to-transparent animate-pulse delay-700" />
        </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#111112] border border-white/10 rounded-3xl w-full max-w-lg relative z-10 shadow-2xl p-8 overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00f2ff] to-transparent group-hover:via-[#7000ff] transition-all duration-700" />
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#7000ff]/10 border border-[#7000ff]/20 mb-4 shadow-[0_0_20px_rgba(112,0,255,0.1)]">
            <UserCheck className="text-[#bc13fe]" size={28} />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter mb-2">Pension<span className="text-[#00f2ff]">Vault</span></h1>
          <p className="text-white/40 text-sm">Join the PensionVault Network</p>
        </div>

        {error && (
            <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-xs text-center mb-6"
            >
                {error}
            </motion.div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2 font-bold ml-1">Full Name</label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-[#00f2ff] focus:bg-white/[0.08] transition-all text-white placeholder:text-white/20 text-sm"
                    placeholder="John Doe"
                    required
                    />
                </div>
            </div>
            <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2 font-bold ml-1">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-[#00f2ff] focus:bg-white/[0.08] transition-all text-white placeholder:text-white/20 text-sm"
                    placeholder="john@example.com"
                    required
                    />
                </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2 font-bold ml-1">Secure Password</label>
            <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-[#7000ff] focus:bg-white/[0.08] transition-all text-white placeholder:text-white/20 text-sm"
                placeholder="••••••••"
                required
                />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2 font-bold ml-1">Your Role</label>
                <select 
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00f2ff] focus:bg-white/[0.08] transition-all text-white appearance-none text-sm"
                >
                    <option value="employee" className="bg-[#111112]">Employee</option>
                    <option value="employer" className="bg-[#111112]">Employer</option>
                </select>
            </div>
            {formData.role === 'employer' && (
                <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2 font-bold ml-1">Organization</label>
                    <div className="relative">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <input 
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-[#7000ff] focus:bg-white/[0.08] transition-all text-white placeholder:text-white/20 text-sm"
                        placeholder="Organization Name"
                        required={formData.role === 'employer'}
                        />
                    </div>
                </div>
            )}
          </div>

          <button 
            type="button"
            onClick={handleSignup}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#00f2ff] to-[#7000ff] text-black py-4 rounded-xl font-bold mt-4 shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:shadow-[0_0_30px_rgba(112,0,255,0.4)] hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating UPID...' : 'Register Protocol Identity'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-white/40">
            Already have an identity? <Link to="/login" className="text-[#00f2ff] hover:underline">Log in</Link>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 text-center text-[10px] text-white/30 uppercase tracking-[0.1em]">
          PensionVault Registration Gateway | Node: Secure-01
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
