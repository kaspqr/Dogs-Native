import { store } from '../../store'
import { dogsApiSlice } from '../dogs/dogsApiSlice'
import { usersApiSlice } from '../users/usersApiSlice'
import { useEffect } from 'react'
import Index from '../../app/index'


const Prefetch = () => {
    useEffect(() => {
        store.dispatch(dogsApiSlice.util.prefetch('getDogs', 'dogsList', { force: true }))
        store.dispatch(usersApiSlice.util.prefetch('getUsers', 'usersList', { force: true }))
    }, [])

    return <Index />
}

export default Prefetch

