import { useSelector } from "react-redux"
import { selectCurrentToken } from "../components/auth/authSlice"
import jwtDecode from "jwt-decode"

const useAuth = () => {
  const token = useSelector(selectCurrentToken)
  let isAdmin = false
  let isSuperAdmin = false
  let status = "User"

  if (token) {
    const decoded = jwtDecode(token)
    const { username, roles, id } = decoded.UserInfo

    isAdmin = roles.includes('Admin')
    isSuperAdmin = roles.includes('SuperAdmin')

    if (isAdmin) status = "Admin"
    if (isSuperAdmin) status = "SuperAdmin"

    return { username, roles, status, isAdmin, isSuperAdmin, "userId": id }
  }

  return { username: '', roles: [], isAdmin, isSuperAdmin, status }
}

export default useAuth
