'use client'

import { Field, Label, Switch } from '@headlessui/react'; // Adjust the import based on your project setup
import { useState } from 'react';
import Header from '../components/Header';

interface FormData {
  firstName: string
  lastName: string
  company: string
  email: string
  product: string[] // Change to array for multi-select
  phoneNumber: string
  message: string
}

interface NavigationItem {
  name: string
  href: string
}



const navigation: NavigationItem[] = [
    { name: '', href: '#' },
 
  ];


const ContactUsSection = () => {
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    product: [], // Initialize as empty array for multi-select
    phoneNumber: '',
    message: ''
  })



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, checked } = e.target as HTMLInputElement;

    if (name === 'product') {
      const updatedProducts = checked
        ? [...formData.product, value] // Add product if checked
        : formData.product.filter((product) => product !== value); // Remove product if unchecked

      setFormData({
        ...formData,
        product: updatedProducts
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!agreed) {
      alert('You must agree to the privacy policy to submit the form.')
      return
    }
    console.log(formData)
    setLoading(true)

    try {
      const response = await fetch('/api/contactforsale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data: { message: string } = await response.json()

      setLoading(false)
      if (data.message === 'Emails sent successfully') {
        alert('Your message has been sent. We will get back to you soon.')
        setFormData({
          firstName: '',
          lastName: '',
          company: '',
          email: '',
          product: [], // Reset to empty array
          phoneNumber: '',
          message: ''
        })
      } else {
        alert('There was an issue sending your message. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]"
        />
      </div>
      <Header navigation={navigation} />

      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">Contact sales</h2>
        <p className="mt-2 text-lg/8 text-gray-600">Aute magna irure deserunt veniam aliqua magna enim voluptate.</p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto mt-16 max-w-xl sm:mt-20">

        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <div>
            <label htmlFor="first-name" className="block text-sm/6 font-semibold text-gray-900">First name</label>
            <input
              id="first-name"
              name="firstName"
              type="text"
              value={formData.firstName}
              required
              onChange={handleChange}
              className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
            />
          </div>
          <div>
            <label htmlFor="last-name" className="block text-sm/6 font-semibold text-gray-900">Last name</label>
            <input
              id="last-name"
              name="lastName"
              required
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="company" className="block text-sm/6 font-semibold text-gray-900">Company</label>
            <input
              id="company"
              name="company"
              type="text"
              required
              value={formData.company}
              onChange={handleChange}
              className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="email" className="block text-sm/6 font-semibold text-gray-900">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="product" className="block text-sm/6 font-semibold text-gray-900">Product</label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="basic"
                  name="product"
                  type="checkbox"
                  required
                  value="Basic"
                  checked={formData.product.includes('Lab Managment System')}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="basic" className="ml-2 text-sm text-gray-900">Lab Managment System</label>
              </div>
              <div className="flex items-center">
                <input
                  id="Billing Management System"
                  name="product"
                  type="checkbox"
                  required
                  value="Pro"
                  checked={formData.product.includes('Billing Management System')}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="pro" className="ml-2 text-sm text-gray-900">Billing Management System</label>
              </div>
              <div className="flex items-center">
                <input
                  id="enterprise"
                  name="product"
                  required
                  type="checkbox"
                  value="Enterprise"
                  checked={formData.product.includes('Ecommerce System')}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="enterprise" className="ml-2 text-sm text-gray-900">Ecommerce System</label>
              </div>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="phone-number" className="block text-sm/6 font-semibold text-gray-900">Phone number</label>
            <input
              id="phone-number"
              name="phoneNumber"
              required
              type="text"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="message" className="block text-sm/6 font-semibold text-gray-900">Message</label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              value={formData.message}
              onChange={handleChange}
              className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
            />
          </div>

          <Field className="flex gap-x-4 sm:col-span-2">
            <div className="flex h-6 items-center">
              <Switch
                checked={agreed}
                onChange={setAgreed}
                className="group flex w-8 flex-none cursor-pointer rounded-full bg-primary p-px ring-1 ring-inset ring-gray-900/5 transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary data-[checked]:bg-secondary"
              >
                <span className="sr-only">Agree to policies</span>
                <span
                  aria-hidden="true"
                  className="size-4 transform rounded-full bg-white shadow-sm ring-1 ring-gray-900/5 transition duration-200 ease-in-out group-data-[checked]:translate-x-3.5"
                />
              </Switch>
            </div>
            <Label className="text-sm/6 text-gray-600">
              By selecting this, you agree to our{' '}
              <a href="#" className="font-semibold text-primary">
                privacy&nbsp;policy
              </a>
              .
            </Label>
          </Field>
        </div>

        <button
          type="submit"
          disabled={!agreed}
          className="mt-8 w-full rounded-md bg-primary py-2 text-base font-semibold text-white hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send message'}
        </button>
      </form>
    </div>
  )
}

export default ContactUsSection









