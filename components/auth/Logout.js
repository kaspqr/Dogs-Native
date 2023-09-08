import { useSendLogoutMutation } from "./authApiSlice"
import { useEffect } from "react"

const Logout = () => {
    // POST request to clear the refreshtoken
    const [sendLogout] = useSendLogoutMutation()

    useEffect(() => {
        sendLogout()
    }, [])
}


export default Logout
