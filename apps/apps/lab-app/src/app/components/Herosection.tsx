import { ChevronRightIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

export default function Herosection() {
  return (
    <div className="relative isolate overflow-hidden bg-white">
      {/* Background with clip-path and gradient with animation */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 animate-gradient-flow"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-gradient-flow"
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:shrink-0 lg:pt-8">
          <img
            alt="tiamed logo"
            src="tiamed1.svg"
            className="h-11"
          />
           <p className="text-gray-500 italic mb-4">
        &quot;Innovating Today, Shaping Tomorrow!&quot;
        </p>

          <div className="mt-24 sm:mt-32 lg:mt-16">
            <a href="#" className="inline-flex space-x-6 animate-fade-in-up">
              <span className="rounded-full bg-indigo-600/10 px-3 py-1 text-sm/6 font-semibold text-purple-700 ring-1 ring-inset ring-indigo-600/10">
                New Release
              </span>
              <span className="inline-flex items-center space-x-2 text-sm/6 font-medium text-gray-600">
                <span> Learn more</span>
                <ChevronRightIcon aria-hidden="true" className="size-5 text-gray-400" />
              </span>
            </a>
          </div>

          {/* Heading Animation */}
          <h1 className="mt-10 text-pretty text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl animate-slide-in">
            Simplify Your Lab Operations
          </h1>

          {/* Description Fade-In */}
          <p className="mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8 animate-fade-in">
            Manage patient data, automate workflows, and generate reports seamlessly with our comprehensive lab management software.
          </p>

          {/* Button Animations */}
          <div className="mt-10 flex items-center gap-x-6">
            <Link
              href="/login"
             className="rounded-md bg-gradient-to-r from-purple-900 to-secondary px-12 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gradient-to-r hover:from-secondary hover:to-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 animate-bounce"
            >
              Login
            </Link>
           
          </div>
        </div>

        {/* Image Section */}
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <img
                alt="App screenshot"
                src="screenshort.png"
                width={2432}
                height={1442}
                className="w-[76rem] rounded-md shadow-2xl ring-1 ring-gray-900/10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
