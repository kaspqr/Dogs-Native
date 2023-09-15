import { CommonActions } from '@react-navigation/native'

let navigator

function setTopLevelNavigator(nav) {
  navigator = nav
}

function navigate(routeName, params) {
  navigator.dispatch(
    CommonActions.navigate({
      name: routeName,
      params,
    })
  )
}

export default {
  navigate,
  setTopLevelNavigator,
}