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
import NewDogForm from "./NewDogForm"
import EditDogForm from "./EditDogForm"
import ConversationsList from "./ConversationsList"
import ConversationPage from "./ConversationPage"
import useAuth from "../hooks/useAuth"
import { useGetUsersQuery } from "../components/users/usersApiSlice"
import { Text } from "react-native"
import Banned from "./Banned"

const Stack = createNativeStackNavigator()

const Home = ({ navigation }) => {

    const { userId } = useAuth()

    // GET the user who's logged in
    const { user } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            user: data?.entities[userId]
        }),
    })

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
                name='Banned' 
                component={Banned} 
            />
            <Stack.Screen 
                name='AdvertisementsList' 
                component={user?.active === false ? Banned : AdvertisementsList} 
            />
            <Stack.Screen 
                name='MenuComponent' 
                component={MenuComponent} 
            />
            <Stack.Screen 
                name='UserPage' 
                component={user?.active === false ? Banned : UserPage} 
            />
            <Stack.Screen 
                name='AdvertisementPage' 
                component={user?.active === false ? Banned : AdvertisementPage} 
            />
            <Stack.Screen 
                name='DogPage' 
                component={user?.active === false ? Banned : DogPage} 
            />
            <Stack.Screen 
                name='Login' 
                component={user?.active === false ? Banned : Login} 
            />
            <Stack.Screen 
                name='NewUserForm' 
                component={user?.active === false ? Banned : NewUserForm} 
            />
            <Stack.Screen 
                name='Faq' 
                component={user?.active === false ? Banned : FAQ} 
            />
            <Stack.Screen 
                name='UsersList' 
                component={user?.active === false ? Banned : UsersList} 
            />
            <Stack.Screen 
                name='DogsList' 
                component={user?.active === false ? Banned : DogsList} 
            />
            <Stack.Screen 
                name='LittersList' 
                component={user?.active === false ? Banned : LittersList} 
            />
            <Stack.Screen 
                name='LitterPage' 
                component={user?.active === false ? Banned : LitterPage} 
            />
            <Stack.Screen 
                name='NewLitterForm' 
                component={user?.active === false ? Banned : NewLitterForm} 
            />
            <Stack.Screen 
                name='EditUserForm' 
                component={user?.active === false ? Banned : EditUserForm} 
            />
            <Stack.Screen 
                name='NewAdvertisementForm' 
                component={user?.active === false ? Banned : NewAdvertisementForm} 
            />
            <Stack.Screen 
                name='EditAdvertisementForm' 
                component={user?.active === false ? Banned : EditAdvertisementForm} 
            />
            <Stack.Screen 
                name='NewDogForm' 
                component={user?.active === false ? Banned : NewDogForm} 
            />
            <Stack.Screen 
                name='EditDogForm' 
                component={user?.active === false ? Banned : EditDogForm} 
            />
            <Stack.Screen 
                name='ConversationsList' 
                component={user?.active === false ? Banned : ConversationsList} 
            />
            <Stack.Screen 
                name='ConversationPage' 
                component={user?.active === false ? Banned : ConversationPage} 
            />
        </Stack.Navigator>
    )

}

export default Home
