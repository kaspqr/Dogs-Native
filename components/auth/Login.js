import { useState, useEffect } from "react"
import { useDispatch, Provider } from "react-redux"
import { store } from "../../store"
import { setCredentials } from "./authSlice"
import { useLoginMutation } from "./authApiSlice"
import usePersist from "../../hooks/usePersist"
import useAuth from "../../hooks/useAuth"
import { TouchableOpacity, View, Text, TextInput, Switch } from "react-native"

const Login = () => {

  const dispatch = useDispatch()

  const auth = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errMsg, setErrMsg] = useState('')
  const [persist, setPersist] = usePersist()

  // POST method for auth (login)
  const [login, { isLoading }] = useLoginMutation()

  useEffect(() => {
    // Clear the error message if the username or password has changed
    setErrMsg('')
  }, [username, password])

  const handleSubmit = async () => {

    if (!username?.length || !password?.length) {
      return setErrMsg('Please enter both the username/email and password')
    }

    try {
      const { accessToken } = await login({ username, password }).unwrap()
      dispatch(setCredentials({ accessToken }))
      setUsername('')
      setPassword('')
    } catch (err) {
      console.log(err)
      if (!err.status) {
        setErrMsg('No Server Response')
      } else if (err.status === 400) {
        setErrMsg('Missing Username or Password')
      } else if (err.status === 403) {
        setErrMsg('Account not verified. Please click the link in your email.')
      } else if (err.status === 401) {
        setErrMsg('Unauthorized')
      } else {
        setErrMsg("Login failed. Make sure you have clicked on the verification link on the email you've provided. "
          + "If you haven't received the email, attempting to log in with an unverified account triggers a new "
          + "verification email being sent to you in case you have waited at least 1 hour since the last try."
        )
      }
    }
  }

  const handleUserInput = (value) => setUsername(value)
  const handlePwdInput = (value) => setPassword(value)
  const handleToggle = () => setPersist(prev => !prev)

  if (isLoading) return <Text>Loading...</Text>

  if (auth?.username?.length) {
    return <Text>You are already logged in.</Text>
  }

  return (
    <Provider store={store}>
    <View>
      <View>
        <Text>User Login</Text>
      </View>

      <View>
        <Text>{errMsg}</Text>

        <Text>Username or Email</Text>

        <TextInput 
          value={username}
          onChangeText={handleUserInput}
          autoComplete="off"
        />

        <Text>Password</Text>

        <TextInput 
          onChangeText={handlePwdInput}
          value={password}
        />

        <View>
          <Text>Stay Logged In</Text>
          <Switch value={persist} onValueChange={handleToggle} />
        </View>

        <TouchableOpacity 
          onPress={handleSubmit}
          disabled={!username?.length || !password?.length}
          style={!username?.length || !password?.length ? {backgroundColor: "grey"} : null}
        >
          <Text>Sign In</Text>
        </TouchableOpacity>

        <Text>Forgot Password? Click here</Text>
      </View>
    </View>
    </Provider>
  )
}

export default Login
