import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { setCredentials } from "../components/auth/authSlice"
import { useLoginMutation } from "../components/auth/authApiSlice"
import usePersist from "../hooks/usePersist"
import useAuth from "../hooks/useAuth"
import { TouchableOpacity, View, Text, TextInput, Switch, StyleSheet } from "react-native"
import AdvertisementsList from "./AdvertisementsList"

const Login = () => {

  const dispatch = useDispatch()

  const auth = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errMsg, setErrMsg] = useState('')
  const [persist, setPersist] = usePersist()

  // POST method for auth (login)
  const [login, { isLoading, isSuccess }] = useLoginMutation()

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

  if (isSuccess) return <AdvertisementsList />

  if (auth?.username?.length) {
    return <Text>You are already logged in.</Text>
  }

  return (
    <View style={styles.mainView}>

      <View>
        <Text style={styles.errMsg}>{errMsg}</Text>

        <Text style={styles.inputTitle}>Username or Email</Text>

        <TextInput 
          style={styles.textInputWide}
          value={username}
          onChangeText={handleUserInput}
          autoComplete="off"
        />

        <Text style={styles.inputTitle}>Password</Text>

        <TextInput 
          style={styles.textInputWide}
          onChangeText={handlePwdInput}
          value={password}
          secureTextEntry={true}
        />

        <View style={styles.paginationRow}>
          <Text style={styles.inputTitle}>Stay Logged In</Text>
          <Switch value={persist} onValueChange={handleToggle} />
        </View>

        <TouchableOpacity 
          onPress={handleSubmit}
          disabled={!username?.length || !password?.length}
          style={!username?.length || !password?.length ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <Text style={{textDecorationLine: 'underline', marginTop: 10}}>Forgot Password? Click here</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  mainView: {
      marginHorizontal: 10,
  },
  blackButtonWide: {
    backgroundColor: '#000000',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  blackButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#000000',
    width: 50,
  },
  blackNewPageButton: {
    backgroundColor: '#000000',
    borderRadius: 5,
    padding: 10,
  },
  greyButton: {
    backgroundColor: 'lightgrey',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  filterViewVisible: {
    flex: 1,
  },
  filterViewHidden: {
    display: 'none',
  },
  textInputWide: {
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 13,
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 5,
    width: 60,
  },
  selectInputWide: {
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  paginationTextView: {
    flex: 1,
    alignItems: 'center',
  },
  paginationInputView: {
    flexDirection: 'row',
    marginTop: 5,
  },
  inputTitle: {
    fontWeight: 'bold',
  },
  errMsg: {
    color: 'red',
  },
})

export default Login
