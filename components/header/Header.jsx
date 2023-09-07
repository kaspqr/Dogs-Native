import React from 'react'

const Header = () => {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>

            <Stack.Screen 
                options={{
                    headerStyle: { backgroundColor: COLORS.beige },
                    headerShadowVisible: true,
                    headerLeft: () => (
                        <ScreenHeaderBtn 
                            iconUrl={images.home} 
                            dimension="100%" 
                        />
                    ),
                    headerRight: () => (
                        <ScreenHeaderBtn 
                            iconUrl={icons.menu} 
                            dimension="60%" 
                            handlePress={() => setMenuOpened(!menuOpened)}
                        />
                    ),
                    headerTitle: "",
                }}
            />

            {menuOpened ? menu : content}
            
        </SafeAreaView>
    )
}

export default Header
