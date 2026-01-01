import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from 'react-router-dom'
import RootLayout from './layout/RootLayout'
import Home from './components/Home'
import AuthLayout from './layout/AuthLayout'
import AuthHomePage from './components/signUpLogin/AuthHomePage'
import Login from './components/signUpLogin/Login'
import SignUp from './components/signUpLogin/SignUp'
import Profile from './components/Profile'
import ProtectedRoute from './components/protectedRoute/ProtectedRoute'
import Mytasks from './components/Crud/Mytasks'
import AssignTask from './components/Crud/AssignTask'
import Pracctice from './components/Pracctice'

function App() {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route element={<ProtectedRoute />}>

          <Route path='/' element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path='profile' element={<Profile />} />
            <Route path='mytasks' element={<Mytasks />} />
            <Route path='assigntasks' element={<AssignTask />} />
            <Route path='practice' element={<Pracctice />} />
          </Route>

        </Route>
        <Route element={<AuthLayout />}>
          <Route path='/user' element={<AuthHomePage />}>
            <Route index element={<Navigate to="login" replace />} />
            <Route path='login' element={<Login />} />
            <Route path='signup' element={<SignUp />} />
          </Route>
        </Route>
      </>
    )
  )

  return <RouterProvider router={router} />
}

export default App
