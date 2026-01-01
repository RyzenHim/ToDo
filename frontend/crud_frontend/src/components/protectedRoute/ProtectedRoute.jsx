
import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

const ProtectedRoute = () => {
    const navigate = useNavigate()
    const token = localStorage.getItem("token")
    if (token === null) {
        alert("Token is not available , Going back to Loginpage")
        navigate('/user/login')
        return
    }
    return <Outlet />
}

export default ProtectedRoute