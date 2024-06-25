import React, { useEffect, useState } from 'react'
import { IoSearchOutline } from "react-icons/io5";
import Loading from './Loading';
import UserSearchCard from './UserSearchCard';
import toast from 'react-hot-toast'
import axios from 'axios';
import { IoClose } from "react-icons/io5";

const SearchUser = ({ onClose }) => {
    const [searchUser, setSearchUser] = useState([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState("")


    const handleSearchUser = async () => {
        const URL = `/api/search-user`
        try {
            setLoading(true)
            const response = await axios.post(URL, {
                search: search
            })
            setLoading(false)

            setSearchUser(response.data.data)

        } catch (error) {
            toast.error(error?.response?.data?.message)
        }
    }

    useEffect(() => {
        handleSearchUser()
    }, [search])

    // console.log("searchUser", searchUser)
    return (
        <div className=' w-screen h-screen fixed top-0 bottom-0 left-0 right-0 bg-slate-700 bg-opacity-40 p-2 z-10 '>
            <div className='h-screen w-2/5 max-md:w-4/5 max-sm:w-full mx-auto mt-10 overflow-y-scroll' >
                {/**input search user */}
                <div className='bg-white rounded h-14 overflow-x-hidden flex '>
                    <input
                        type='text'
                        placeholder='Search user by name, email....'
                        className='w-full outline-none py-1 h-full px-4'
                        onChange={(e) => setSearch(e.target.value)}
                        value={search}
                    />
                    <div className='h-14 w-14 flex justify-center items-center'>
                        <IoSearchOutline size={25} />
                    </div>
                </div>

                {/**display search user */}
                <div className='bg-white mt-2 w-full p-4 rounded'>
                    {/**no user found */}
                    {
                        searchUser.length === 0 && !loading && (
                            <p className='text-center text-slate-500'>no user found!</p>
                        )
                    }

                    {
                        loading && (
                            <p><Loading /></p>
                        )
                    }

                    {
                        searchUser.length !== 0 && !loading && (
                            searchUser.map((user, index) => {
                                return (
                                    <UserSearchCard key={user._id} user={user} onClose={onClose} />
                                )
                            })
                        )
                    }


                </div>
            </div>

            <div className='absolute top-0 right-0 text-2xl p-2 lg:text-4xl hover:text-white' onClick={onClose}>
                <button>
                    <IoClose />
                </button>
            </div>
        </div>
    )
}

export default SearchUser
