export default function AboutSection() {
    return (
      <div className="bg-white py-20 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Empowering Labs with Innovation
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Our software solutions are designed to revolutionize lab management, ensuring efficiency, security, and seamless operations.
            </p>
          </div>
  
          <div className="mt-12 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-2">
            <div className="flex items-center justify-center sm:justify-start">
              <img
                alt="About Us"
                src="about-image.png" // Update with your actual image
                className="w-full rounded-xl shadow-lg object-cover"
                style={{ height: "400px" }} // You can adjust this based on your preference
              />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-semibold text-gray-900">Why Choose Our Solution?</h3>
              <p className="mt-4 text-lg text-gray-500">
                We offer a fully integrated system that ensures your lab runs smoothly. From patient management to billing and everything in between, our platform provides a comprehensive suite of tools to meet your lab’s unique needs.
              </p>
              <ul className="mt-6 space-y-4 text-gray-500 list-disc pl-6">
                <li>Enhanced patient-doctor integration for streamlined workflows.</li>
                <li>Automated testing processes and report generation.</li>
                <li>Comprehensive security measures to ensure privacy and compliance.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
  