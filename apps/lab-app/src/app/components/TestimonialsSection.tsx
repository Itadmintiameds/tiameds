export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Dr. Sarah Jones",
      role: "Laboratory Director",
      image: "dr-sarah.jpg", // Replace with actual image
      feedback:
        "This software has revolutionized our lab's operations. The patient and doctor integration is seamless, and the automation of test workflows has saved us hours of work every day!",
    },
    {
      name: "John Smith",
      role: "Lab Technician",
      image: "john-smith.jpg", // Replace with actual image
      feedback:
        "The user-friendly interface makes managing patient data and test results so much easier. Our team has experienced a huge improvement in efficiency since adopting this system.",
    },
    {
      name: "Jane Doe",
      role: "Medical Consultant",
      image: "jane-doe.jpg", // Replace with actual image
      feedback:
        "I love the customizable workflows. The software is tailored to our lab's needs, which has made our processes more streamlined and compliant with regulations.",
    },
  ];

  return (
    <div className="bg-gray-50 py-20 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            What Our Clients Are Saying
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Hear directly from our satisfied customers who have experienced the difference in their lab operations.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg"
            >
              <img
                alt={testimonial.name}
                src={testimonial.image}
                className="w-24 h-24 rounded-full object-cover shadow-md"
              />
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                {testimonial.name}
              </h3>
              <p className="text-gray-500">{testimonial.role}</p>
              <p className="mt-4 text-gray-600 italic">"{testimonial.feedback}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
