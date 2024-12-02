const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
          What Our Customers Are Saying
        </h2>
        <p className="mt-4 text-lg text-gray-600 sm:text-xl">
          See how our platform has made a difference for businesses like yours.
        </p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {[
            {
              name: "John Doe",
              role: "Lab Manager",
              testimonial:
                '"This platform has transformed the way we run our lab. It\'s intuitive and easy to use."',
            },
            {
              name: "Jane Smith",
              role: "Operations Director",
              testimonial:
                '"The automation features have saved us so much time. Highly recommended!"',
            },
            {
              name: "Mark Wilson",
              role: "CEO",
              testimonial:
                '"The support team is exceptional, and the platform is so reliable. It’s a game-changer."',
            },
          ].map((testimony, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-all duration-300 ease-in-out"
            >
              <p className="text-lg text-gray-600 italic">{testimony.testimonial}</p>
              <div className="mt-6 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                  {testimony.name[0]}
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-900">{testimony.name}</p>
                  <p className="text-gray-600">{testimony.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
