import React, { useState } from "react";
import axios from 'axios'
import { useNavigate } from "react-router-dom";
const Login = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    const handleLoginSubmit = async () => {

        const loginData = { email, password }
        try {
            const postData = await axios.post('http://localhost:8080/user/login', loginData)
            localStorage.setItem('token', postData.data.token)
            navigate('/')
        } catch (error) {
            alert('Login Failed at frontend :- ', error)
        }
    }


    return (
        <div className="w-full">
            <h2 className="text-2xl font-semibold text-white mb-2">
                Welcome back
            </h2>
            <p className="text-sm text-gray-300 mb-6">
                Sign in to continue your experience
            </p>

            <div className="space-y-4">
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
                    onClick={handleLoginSubmit}
                    className="relative w-full py-3 mt-2 rounded-lg
                     bg-indigo-600 text-white text-sm font-medium
                     hover:bg-indigo-500
                     shadow-[0_12px_35px_rgba(99,102,241,0.45)]
                     transition-all duration-300
                     active:scale-[0.98]"
                >
                    Sign In
                </button>
            </div>
        </div>
    );
};

export default Login;
