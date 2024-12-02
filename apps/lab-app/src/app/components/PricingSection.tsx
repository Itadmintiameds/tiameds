const PricingSection: React.FC = () => {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 text-center">
                <h2 className="text-4xl font-extrabold text-gray-900">Pricing Plans</h2>
                <p className="mt-4 text-lg text-gray-600">Choose the plan thatgit&lsquo;s right for your business.</p>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Basic Plan */}
                    <div className="border rounded-lg p-6 bg-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                        <h3 className="text-2xl font-semibold text-gray-900">Basic</h3>
                        <p className="mt-2 text-2xl font-bold text-indigo-600">$19/month</p>
                        <ul className="mt-4 space-y-2 text-gray-600">
                            <li>Basic support</li>
                            <li>Up to 100 users</li>
                            <li>Standard features</li>
                        </ul>
                        <a
                            href="#"
                            className="mt-6 inline-block bg-indigo-600 text-white px-6 py-3 rounded-md shadow-md hover:shadow-lg transition-all"
                        >
                            Choose Plan
                        </a>
                    </div>

                    {/* Pro Plan (Active Plan with Highlight) */}
                    <div className="border-4 border-indigo-600 rounded-lg p-6 bg-indigo-600 text-white shadow-lg hover:shadow-2xl transition-all transform hover:scale-105">
                        <h3 className="text-2xl font-semibold">Pro</h3>
                        <p className="mt-2 text-2xl font-bold">$49/month</p>
                        <ul className="mt-4 space-y-2">
                            <li>Priority support</li>
                            <li>Unlimited users</li>
                            <li>Advanced features</li>
                        </ul>
                        <a
                            href="#"
                            className="mt-6 inline-block bg-white text-indigo-600 px-6 py-3 rounded-md shadow-md hover:shadow-lg transition-all"
                        >
                            Choose Plan
                        </a>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="border rounded-lg p-6 bg-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                        <h3 className="text-2xl font-semibold text-gray-900">Enterprise</h3>
                        <p className="mt-2 text-2xl font-bold text-indigo-600">$99/month</p>
                        <ul className="mt-4 space-y-2 text-gray-600">
                            <li>24/7 support</li>
                            <li>Unlimited users</li>
                            <li>All features included</li>
                        </ul>
                        <a
                            href="#"
                            className="mt-6 inline-block bg-indigo-600 text-white px-6 py-3 rounded-md shadow-md hover:shadow-lg transition-all"
                        >
                            Choose Plan
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
