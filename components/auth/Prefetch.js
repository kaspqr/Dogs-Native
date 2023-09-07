import { store } from '../../app/store'
import { dogsApiSlice } from '../dogs/dogsApiSlice'
import { usersApiSlice } from '../users/usersApiSlice'
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'


const Prefetch = () => {
    useEffect(() => {
        store.dispatch(dogsApiSlice.util.prefetch('getDogs', 'dogsList', { force: true }))
        store.dispatch(usersApiSlice.util.prefetch('getUsers', 'usersList', { force: true }))
    }, [])

    return <Outlet />
}

export default Prefetch

