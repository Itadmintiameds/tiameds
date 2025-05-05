"use client"
import React, { useState } from 'react'
import { FaArrowLeft, FaSignInAlt, FaClipboardList } from 'react-icons/fa'
import Link from 'next/link'
import Login from '../components/Login'
import Image from 'next/image'
import BeataComponent from '@/app/(admin)/component/common/BeataComponent'

const Page: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'onboarding'>('login')

  const handleTabSwitch = (tab: 'login' | 'onboarding') => {
    setActiveTab(tab)
  }

  return (
    <div className="h-screen flex">
      {/* Left Panel */}
      <div className="w-full sm:w-1/3 bg-white flex flex-col justify-center items-center p-8">
        <div className="flex justify-center mb-6">
          <Image src="/tiamed1.svg" alt="Tiamed Logo" width={80} height={80} />
        </div>

        <p className="text-gray-500 text-center italic mb-4">
        &quot;Innovating Today, Shaping Tomorrow!&quot;
        </p>

        <h1 className="text-3xl font-bold text-purple-800 mb-3">
          Welcome to Tiamed
        </h1>

        <p className="text-gray-700 text-center mb-6">
          Seamlessly manage your laboratory with our powerful, user-friendly system.
        </p>

        <Link href="/" passHref>
          <button className="flex items-center mt-6 text-sm font-semibold text-purple-800 hover:text-secondary transition-all duration-300">
            <FaArrowLeft className="mr-2" /> Back to Home
          </button>
        </Link>
      </div>

      {/* Right Panel */}
      <div className="flex-1 relative isolate bg-white">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 animate-gradient-flow"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center border-b border-gray-200 bg-gray-50 shadow-sm">
          <button
            className={`flex items-center justify-center w-1/2 py-4 text-lg font-semibold transition-all ${activeTab === 'login'
              ? 'text-purple-800 border-b-2 border-primary bg-white hover:border-primary'
              : 'text-tertiary hover:text-secondary'
              }`}
            onClick={() => handleTabSwitch('login')}
          >
            <FaSignInAlt className="mr-2" />
            Log In
          </button>
          <button
            className={`flex items-center justify-center w-1/2 py-4 text-lg font-semibold transition-all ${activeTab === 'onboarding'
              ? 'text-purple-800 border-b-2 border-primary bg-white'
              : 'text-tertiary hover:text-secondary'
              }`}
            onClick={() => handleTabSwitch('onboarding')}
          >
            <FaClipboardList className="mr-2" />
            Onboarding
          </button>
        </div>

        {/* Tab Content */}
        <div className="sm:p-8 px-4 py-6">
          {activeTab === 'login' ? (
            <Login />
          ) : (
            <BeataComponent />
          )}
        </div>
      </div>
    </div>
  )
}

export default Page
