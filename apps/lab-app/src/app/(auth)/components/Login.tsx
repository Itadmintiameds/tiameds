import React, { useState } from 'react'
import Link from 'next/link'
import { FaUser, FaLock } from 'react-icons/fa'
import Image from 'next/image'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // Simulating a login request
    setTimeout(() => {
      if (email === 'admin@lab.com' && password === 'admin123') {
        alert('Login Successful')
      } else {
        setError('Invalid email or password')
      }
      setIsSubmitting(false)
    }, 2000)
  }

  return (
    <div className="flex h-screen  items-center justify-center ">
      <div className=" ">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          
        <Image src = "/tiamed1.svg" alt="Lab Management System" className="h-16" />
        </div>

        {/* Welcome Text */}
        <h2 className="text-center text-2xl font-bold text-indigo-800">
          Welcome Back!
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Sign in to your Lab Management System account
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative mt-1">
              <FaUser className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 rounded-md border border-gray-300 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <FaLock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 rounded-md border border-gray-300 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Footer Links */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Forgot your password?{' '}
          <Link href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
            Reset here
          </Link>
        </p>
        {/* <p className="mt-2 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Register now
          </Link>
        </p> */}
      </div>
    </div>
  )
}

export default Login
