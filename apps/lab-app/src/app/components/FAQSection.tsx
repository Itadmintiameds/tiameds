export default function FAQSection() {
    return (
      <div className="bg-gray-50 py-20 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Find answers to common questions about our product.
            </p>
          </div>
  
          <div className="mt-12 space-y-8">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                How does the free trial work?
              </h3>
              <p className="mt-2 text-gray-600">
                You can try out all the features for free for 14 days. No credit card required, and you can cancel anytime.
              </p>
            </div>
  
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Can I integrate the software with existing systems?
              </h3>
              <p className="mt-2 text-gray-600">
                Yes! Our software integrates with most common lab management systems and electronic health records (EHR).
              </p>
            </div>
  
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Do you provide customer support?
              </h3>
              <p className="mt-2 text-gray-600">
                We offer 24/7 customer support via chat, email, and phone. Our dedicated support team is always ready to help.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  