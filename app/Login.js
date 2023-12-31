import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { setCredentials } from "../components/auth/authSlice"
import { useLoginMutation } from "../components/auth/authApiSlice"
import usePersist from "../hooks/usePersist"
import useAuth from "../hooks/useAuth"
import { TouchableOpacity, View, Text, TextInput, Switch, StyleSheet, ScrollView } from "react-native"
import { COLORS } from "../constants"

const Login = ({ navigation }) => {

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

  if (isLoading) return <Text style={{ margin: 10 }}>Loading...</Text>

  if (isSuccess) navigation.navigate('AdvertisementsList')

  if (auth?.username?.length) {
    return <Text style={{ margin: 10 }}>You are already logged in.</Text>
  }

  return (
    <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>
      <View style={styles.mainView}>

        <View>

          <Text style={{ marginBottom: 15, fontSize: 20, fontWeight: 'bold' }}>Login</Text>

          {errMsg?.length ? <Text style={styles.errMsg}>{errMsg}</Text> : null}

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
            <Text style={[styles.inputTitle, {marginRight: 5}]}>Stay Logged In</Text>
            <Switch value={persist} onValueChange={handleToggle} />
          </View>

          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={!username?.length || !password?.length}
            style={!username?.length || !password?.length ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide}
          >
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{marginTop: 10}} onPress={() => navigation.navigate('ResetPassword')}>
            <Text style={{textDecorationLine: 'underline'}}>Forgot Password? Click here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  mainView: {
    marginHorizontal: 10,
    marginBottom: 30,
    marginTop: 10,
  },
  blackButtonWide: {
    backgroundColor: '#000000',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  greyButton: {
    backgroundColor: 'lightgrey',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textInputWide: {
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 13,
    marginBottom: 10,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  inputTitle: {
    fontWeight: 'bold',
  },
  errMsg: {
    color: 'red',
  },
})

export default Login
