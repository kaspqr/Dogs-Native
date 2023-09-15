import { useGetLittersQuery } from "./littersApiSlice"
import { useGetDogsQuery } from "../dogs/dogsApiSlice"
import { memo } from "react"
import { Text, TouchableOpacity, StyleSheet, View } from "react-native"
import navigationService from "../../app/navigationService"

const Litter = ({ litterId }) => {

    // GET the litter with all of it's .values
    const { litter } = useGetLittersQuery("littersList", {
        selectFromResult: ({ data }) => ({
            litter: data?.entities[litterId]
        }),
    })

    // GET the litter's mother dog with all of it's .values
    const { mother } = useGetDogsQuery("dogsList", {
        selectFromResult: ({ data }) => ({
            mother: data?.entities[litter?.mother]
        }),
    })

    // GET the litter's father dog with all of it's .values
    const { father } = useGetDogsQuery("dogsList", {
        selectFromResult: ({ data }) => ({
            father: data?.entities[litter?.father]
        }),
    })

    if (!litter || !mother) {
        return null
    }

    return (
        <View style={styles.litterView}>
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text>Mother </Text> 
                    <TouchableOpacity onPress={() => navigationService.navigate('DogPage', { dogid: mother?.id })}>
                        <Text style={styles.orangeLink}>{mother?.name}</Text>
                    </TouchableOpacity>
                </View>
                {father 
                    ? <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text>Father </Text> 
                        <TouchableOpacity onPress={() => navigationService.navigate('DogPage', { dogid: father?.id })}>
                            <Text style={styles.orangeLink}>{father?.name}</Text>
                        </TouchableOpacity>
                    </View>
                    : <Text>Father Not Added</Text>
                }
                <Text>Born {litter?.born?.split(' ').slice(1, 4).join(' ')}</Text>
                <Text>{litter?.region?.length ? `${litter?.region}, ` : null}{litter?.country}</Text>
                <Text>{litter?.breed}</Text>
                <Text>{litter?.children} {litter?.children === 1 ? 'Puppy' : 'Puppies'}</Text>
            </View>

            <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
                <TouchableOpacity onPress={() => navigationService.navigate('LitterPage', { litterid: litterId })}>
                    <Text style={styles.orangeLink}>View Litter</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    litterView: {
        flexDirection: 'row',
        wordWrap: 'wrap',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#d3d3d3',
        padding: 10,
        marginTop: 5,
        marginBottom: 5,
    },
    orangeLink: {
        color: '#eb9b34',
        fontWeight: 'bold',
    }
})

const memoizedLitter = memo(Litter)

export default memoizedLitter
