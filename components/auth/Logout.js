import { useSendLogoutMutation } from "./authApiSlice"
import AdvertisementsList from "../advertisements/AdvertisementsList"
import { Text } from "react-native"
import { useEffect } from "react"

const Logout = () => {
    // POST request to clear the refreshtoken
    const [sendLogout, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useSendLogoutMutation()

    useEffect(() => {
        sendLogout()
    }, [])
}


export default Logout
