import AdvertisementsList from "./AdvertisementsList"
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { COLORS, images, icons } from "../constants"
import ScreenHeaderBtn from "../components/header/ScreenHeaderBtn"
import MenuComponent from "./MenuComponent"
import UserPage from "./UserPage"
import AdvertisementPage from "./AdvertisementPage"
import DogPage from "./DogPage"
import FAQ from './Faq'
import UsersList from './UsersList'
import DogsList from './DogsList'
import LittersList from './LittersList'
import LitterPage from './LitterPage'
import NewLitterForm from './NewLitterForm'
import Login from './Login'
import NewUserForm from './NewUserForm'
import EditUserForm from "./EditUserForm"
import NewAdvertisementForm from "./NewAdvertisementForm"
import EditAdvertisementForm from "./EditAdvertisementForm"

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
                        handlePress={() => navigation.navigate('MenuComponent')}
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
                name='MenuComponent' 
                component={MenuComponent} 
            />
            <Stack.Screen 
                name='UserPage' 
                component={UserPage} 
            />
            <Stack.Screen 
                name='AdvertisementPage' 
                component={AdvertisementPage} 
            />
            <Stack.Screen 
                name='DogPage' 
                component={DogPage} 
            />
            <Stack.Screen 
                name='Login' 
                component={Login} 
            />
            <Stack.Screen 
                name='NewUserForm' 
                component={NewUserForm} 
            />
            <Stack.Screen 
                name='Faq' 
                component={FAQ} 
            />
            <Stack.Screen 
                name='UsersList' 
                component={UsersList} 
            />
            <Stack.Screen 
                name='DogsList' 
                component={DogsList} 
            />
            <Stack.Screen 
                name='LittersList' 
                component={LittersList} 
            />
            <Stack.Screen 
                name='LitterPage' 
                component={LitterPage} 
            />
            <Stack.Screen 
                name='NewLitterForm' 
                component={NewLitterForm} 
            />
            <Stack.Screen 
                name='EditUserForm' 
                component={EditUserForm} 
            />
            <Stack.Screen 
                name='NewAdvertisementForm' 
                component={NewAdvertisementForm} 
            />
            <Stack.Screen 
                name='EditAdvertisementForm' 
                component={EditAdvertisementForm} 
            />
        </Stack.Navigator>
    )

}

export default Home
