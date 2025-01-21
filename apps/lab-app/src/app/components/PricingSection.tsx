export default function PricingSection() {
    return (
      <div className="bg-white py-20 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Simple Pricing, Powerful Features
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Choose a plan that fits your lab's needs. All plans include free updates and access to our 24/7 support.
            </p>
          </div>
  
          <div className="mt-12 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-50 p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900">Basic Plan</h3>
              <p className="mt-4 text-lg text-gray-600">$29/month</p>
              <ul className="mt-6 space-y-4 text-gray-500 list-disc pl-6">
                <li>5 users</li>
                <li>Basic Reporting</li>
                <li>Standard Support</li>
              </ul>
              <button className="mt-8 w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">
                Start Free Trial
              </button>
            </div>
  
            <div className="bg-gray-50 p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900">Pro Plan</h3>
              <p className="mt-4 text-lg text-gray-600">$59/month</p>
              <ul className="mt-6 space-y-4 text-gray-500 list-disc pl-6">
                <li>50 users</li>
                <li>Advanced Reporting</li>
                <li>Priority Support</li>
                <li>Insurance Management</li>
              </ul>
              <button className="mt-8 w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">
                Start Free Trial
              </button>
            </div>
  
            <div className="bg-gray-50 p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900">Enterprise Plan</h3>
              <p className="mt-4 text-lg text-gray-600">$99/month</p>
              <ul className="mt-6 space-y-4 text-gray-500 list-disc pl-6">
                <li>Unlimited users</li>
                <li>Custom Workflows</li>
                <li>Dedicated Account Manager</li>
              </ul>
              <button className="mt-8 w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">
                Contact Us for Custom Pricing
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  