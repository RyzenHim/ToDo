import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
    const navigate = useNavigate()
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSignup = async () => {
        const signupdata = { name, email, password }

        const postSignUpData = await axios.post('http://localhost:8080/user/signup', signupdata)
        alert('Signup Completed Please login')
        navigate('/user/login')

    }

    return (
        <div className="w-full">
            {/* TITLE */}
            <h2 className="text-2xl font-semibold text-white mb-2">
                Create your account
            </h2>
            <p className="text-sm text-gray-300 mb-6">
                Join the experience in just a few steps
            </p>

            {/* FORM */}
            <div className="space-y-4">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="Full name"
                    className="w-full px-4 py-3 text-sm
                     bg-white/10 text-white
                     placeholder-gray-400
                     border border-white/20 rounded-lg
                     backdrop-blur-md
                     shadow-inner
                     focus:outline-none focus:border-indigo-400
                     focus:ring-1 focus:ring-indigo-400/40
                     transition"
                />

                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="Email address"
                    className="w-full px-4 py-3 text-sm
                     bg-white/10 text-white
                     placeholder-gray-400
                     border border-white/20 rounded-lg
                     backdrop-blur-md
                     shadow-inner
                     focus:outline-none focus:border-indigo-400
                     focus:ring-1 focus:ring-indigo-400/40
                     transition"
                />

                <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="Password"
                    className="w-full px-4 py-3 text-sm
                     bg-white/10 text-white
                     placeholder-gray-400
                     border border-white/20 rounded-lg
                     backdrop-blur-md
                     shadow-inner
                     focus:outline-none focus:border-indigo-400
                     focus:ring-1 focus:ring-indigo-400/40
                     transition"
                />

                <button
                    onClick={handleSignup}
                    className="relative w-full py-3 mt-2 rounded-lg
                     bg-indigo-600 text-white text-sm font-medium
                     hover:bg-indigo-500
                     shadow-[0_12px_35px_rgba(99,102,241,0.45)]
                     transition-all duration-300
                     active:scale-[0.98]"
                >
                    Create Account
                </button>
            </div>
        </div>
    );
};

export default SignUp;
