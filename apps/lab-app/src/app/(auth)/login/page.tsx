'use client'

import React, { useState } from 'react'
import { FaArrowLeft, FaSignInAlt, FaUserPlus } from 'react-icons/fa'
import Link from 'next/link'
import Login from '../components/Login'
import Register from '../components/Register'
import Image from 'next/image'

const Page: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  const handleTabSwitch = (tab: 'login' | 'register') => {
    setActiveTab(tab)
  }

  return (
    <div className="h-screen flex bg-gradient-to-r from-gray-50 to-indigo-200">
      {/* Left Panel */}
      <div className="w-full sm:w-1/3 bg-white flex flex-col justify-center items-center p-8">
       
        <Image src = "/tiamed2.svg" alt="Lab Management System" className="h-16" />
        <h1 className="text-3xl font-bold text-indigo-600 mb-4">Welcome to Tiamed</h1>
        <p className="text-gray-500 text-center mb-6">
          Manage your laboratory seamlessly with our powerful system.
        </p>
        <Link href="/" passHref>
          <button className="flex items-center mt-6 text-sm font-semibold text-indigo-500 hover:text-indigo-700 transition-all duration-300">
            <FaArrowLeft className="mr-2" /> Back to Home
          </button>
        </Link>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Tab Navigation */}
        <div className="flex justify-center border-b border-gray-200 bg-gray-50 shadow-sm">
          <button
            className={`flex items-center justify-center w-1/2 py-4 text-lg font-semibold transition-all ${
              activeTab === 'login'
                ? 'text-indigo-600 border-b-4 border-indigo-500 bg-white'
                : 'text-gray-500 hover:text-indigo-500'
            }`}
            onClick={() => handleTabSwitch('login')}
          >
            <FaSignInAlt className="mr-2" />
            Log In
          </button>
          <button
            className={`flex items-center justify-center w-1/2 py-4 text-lg font-semibold transition-all ${
              activeTab === 'register'
                ? 'text-indigo-600 border-b-4 border-indigo-500 bg-white'
                : 'text-gray-500 hover:text-indigo-500'
            }`}
            onClick={() => handleTabSwitch('register')}
          >
            <FaUserPlus className="mr-2" />
            Register
          </button>
        </div>

        {/* Content Area */}
        {/* <div className="flex-1 flex justify-center items-center bg-gradient-to-br from-gray-50 to-indigo-100 p-4 sm:p-8">
          {activeTab === 'login' ? <Login /> : <Register />}
        </div> */}
        <div className=" bg-gradient-to-br from-gray-50 to-indigo-100 sm:p-8">
          {activeTab === 'login' ? <Login /> : <Register />}
        </div>
      </div>
    </div>
  )
}

export default Page
