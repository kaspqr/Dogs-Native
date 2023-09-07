import { useLocation, Navigate, Outlet } from "react-router-dom"
import useAuth from "../../hooks/useAuth"

const RequireAuth = () => {
    
    const location = useLocation()
    const { roles } = useAuth()

    let content = <Outlet />

    if (!roles.length) {
        content = (
            <Navigate to="/login" state={{ from: location }} replace />
        )
    }

    return content
}

export default RequireAuth

