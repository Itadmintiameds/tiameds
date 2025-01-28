import React from 'react'
import { FaSpinner } from 'react-icons/fa'

const Loader = () => {
    return (
        <div className="flex justify-center items-center p-4">
            <FaSpinner className="animate-spin text-3xl text-primary" />
        </div>
    )
}

export default Loader