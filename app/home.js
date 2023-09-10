import AdvertisementsList from "./AdvertisementsList"
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { COLORS, images, icons } from "../constants"
import ScreenHeaderBtn from "../components/header/ScreenHeaderBtn"
import Menu from "./Menu"
import UserPage from "./UserPage"

const Stack = createNativeStackNavigator()

const Home = ({ navigation }) => {

    return (
        <Stack.Navigator
            initialRouteName="AdvertisementsList"
            screenOptions={{
                headerStyle: { backgroundColor: COLORS.beige },
                headerShadowVisible: true,
                headerLeft: () => (
                    <ScreenHeaderBtn 
                        iconUrl={images.home} 
                        dimension="100%" 
                        handlePress={() => navigation.navigate('AdvertisementsList')}
                    />
                ),
                headerRight: () => (
                    <ScreenHeaderBtn 
                        iconUrl={icons.menu} 
                        dimension="60%" 
                        handlePress={() => navigation.navigate('Menu')}
                    />
                ),
                headerTitle: "",
            }}
        >
            <Stack.Screen 
                name='AdvertisementsList' 
                component={AdvertisementsList} 
            />
            <Stack.Screen 
                name='Menu' 
                component={Menu} 
            />
            <Stack.Screen 
                name='UserPage' 
                component={UserPage} 
            />
        </Stack.Navigator>
    )

}

export default Home
