const CTASection: React.FC = () => {
    return (
        <section className="py-16 bg-indigo-600 text-white">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 text-center">
                <h2 className="text-4xl font-extrabold text-white sm:text-5xl">Ready to Get Started?</h2>
                <p className="mt-4 text-lg sm:text-xl text-gray-200">Join thousands of users who are already benefiting from our platform. Don’t miss out on the future of innovation!</p>
                <div className="mt-8">
                    <a
                        href="#"
                        className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold shadow-md hover:shadow-xl transition-all transform hover:scale-105"
                    >
                        Get Started Now
                    </a>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
