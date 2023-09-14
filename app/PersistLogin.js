import { useEffect, useRef, useState } from "react"
import { useRefreshMutation } from "../components/auth/authApiSlice"
import usePersist from "../hooks/usePersist"
import { useSelector } from "react-redux"
import { selectCurrentToken } from "../components/auth/authSlice"
import { Text } from "react-native"
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Prefetch from "./Prefetch"

const Stack = createNativeStackNavigator()

const PersistLogin = () => {

    const [persist] = usePersist()
    const token = useSelector(selectCurrentToken)
    const effectRan = useRef(false)

    const [trueSuccess, setTrueSuccess] = useState(false)

    const [refresh, {
        isUninitialized,
        isLoading,
        isSuccess,
        isError,
        error
    }] = useRefreshMutation()


    useEffect(() => {
        if (effectRan.current === true || process.env.NODE_ENV !== 'development') { // React 18 StrictMode
            const verifyRefreshToken = async () => {
                console.log('verifying refresh token')

                try {
                    await refresh()
                    setTrueSuccess(true)
                } catch (err) {
                    console.error(err)
                }
            }

            if (!token && persist) verifyRefreshToken()
        }

        return () => effectRan.current = true

        // eslint-disable-next-line
    }, [])
    
    if (!persist) { // persist: no
        console.log('no persist')
    } else if (isLoading) { // persist: yes, token: no
        console.log('loading')
        return <Text>Loading...</Text>
    } else if (isError) { // persist: yes, token: no
        console.log('You are not logged in')
        console.log(error?.data?.message)
    } else if (isSuccess && trueSuccess) { // persist: yes, token: yes
        console.log('success')
    } else if (token && isUninitialized) { // persist: yes, token: yes
        console.log('token and uninit')
        console.log(isUninitialized)
    }

    console.log('You are logged out.')

    return <Stack.Navigator
        initialRouteName="Prefetch"
        screenOptions={{
            headerShown: false
        }}
    >
        <Stack.Screen 
            name="Prefetch" 
            component={Prefetch} 
        />
    </Stack.Navigator>
}

export default PersistLogin
