// 'use client';

// const BlogInsightsSection = () => {
//   const blogPosts = [
//     {
//       title: 'Innovating Healthcare: The Future of Patient Data Management',
//       description:
//         'Explore the latest trends in healthcare data management and how technology is transforming patient care efficiency.',
//       image: 'https://via.placeholder.com/500', // Placeholder image URL
//       link: '/blog/innovating-healthcare', // Link to detailed blog post
//     },
//     {
//       title: 'Telemedicine: Revolutionizing Remote Patient Care',
//       description:
//         'Learn about how telemedicine is changing the landscape of patient care and the benefits it brings to both providers and patients.',
//       image: 'https://via.placeholder.com/500', // Placeholder image URL
//       link: '/blog/telemedicine-revolution', // Link to detailed blog post
//     },
//     {
//       title: 'Data Security in Healthcare: Protecting Patient Privacy',
//       description:
//         'Understand the importance of data security in the healthcare sector and best practices for ensuring patient privacy and trust.',
//       image: 'https://via.placeholder.com/500', // Placeholder image URL
//       link: '/blog/data-security-healthcare', // Link to detailed blog post
//     },
//   ];

//   return (
//     <section className="relative py-20 px-6 lg:py-28 lg:px-8 bg-background">
//       {/* Background Gradient */}
//       <div
//         aria-hidden="true"
//         className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl"
//       >
//         <div
//           className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
//           style={{
//             clipPath:
//               'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
//           }}
//         />
//       </div>

//       <div className="mx-auto max-w-6xl text-center">
//         <h2 className="text-4xl font-extrabold tracking-tight text-textdark sm:text-5xl animate-fade-in-up">
//           Latest Insights & Blog Posts
//         </h2>
//         <p className="mt-6 text-lg text-textmuted max-w-3xl mx-auto animate-fade-in">
//           Stay updated with our latest articles, case studies, and insights into the healthcare technology landscape.
//         </p>
//       </div>

//       <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
//         {blogPosts.map((post, index) => (
//           <div
//             key={index}
//             className="relative flex flex-col items-center text-center p-6 bg-cardbackground shadow-lg rounded-lg transition-all duration-300 hover:bg-cardhover"
//           >
//             <img
//               src={post.image}
//               alt={post.title}
//               className="w-full h-64 object-cover rounded-lg mb-6 transition-transform duration-300 transform hover:scale-105"
//             />
//             <h3 className="text-xl font-semibold text-textdark">{post.title}</h3>
//             <p className="text-sm text-textmuted mt-4">{post.description}</p>
//             <a
//               href={post.link}
//               className="mt-6 inline-block text-primary font-semibold hover:text-textdark transition duration-200"
//             >
//               Read Full Post → 
//             </a>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };

// export default BlogInsightsSection;


'use client';

const BlogInsightsSection = () => {
  const blogPosts = [
    {
      title: 'Innovating Healthcare: The Future of Patient Data Management',
      description:
        'Explore the latest trends in healthcare data management and how technology is transforming patient care efficiency.',
      image: 'https://via.placeholder.com/500', // Placeholder image URL
      link: '/blog/innovating-healthcare', // Link to detailed blog post
    },
    {
      title: 'Telemedicine: Revolutionizing Remote Patient Care',
      description:
        'Learn about how telemedicine is changing the landscape of patient care and the benefits it brings to both providers and patients.',
      image: 'https://via.placeholder.com/500', // Placeholder image URL
      link: '/blog/telemedicine-revolution', // Link to detailed blog post
    },
    {
      title: 'Data Security in Healthcare: Protecting Patient Privacy',
      description:
        'Understand the importance of data security in the healthcare sector and best practices for ensuring patient privacy and trust.',
      image: 'https://via.placeholder.com/500', // Placeholder image URL
      link: '/blog/data-security-healthcare', // Link to detailed blog post
    },
  ];

  return (
    <section className="relative py-20 px-6 lg:py-28 lg:px-8 bg-background overflow-hidden">
      {/* Background Gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl text-center relative z-10">
        <h2 className="text-4xl font-extrabold tracking-tight text-textdark sm:text-5xl animate-fade-in-up">
          Latest Insights & Blog Posts
        </h2>
        <p className="mt-6 text-lg text-textmuted max-w-3xl mx-auto animate-fade-in">
          Stay updated with the latest trends, innovations, and insights in healthcare technology.
        </p>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post, index) => (
          <div
            key={index}
            className="relative flex flex-col items-center text-center p-6 bg-cardbackground shadow-lg rounded-lg transition-all duration-300 hover:bg-cardhover"
          >
            <div className="w-full h-64 bg-gray-200 overflow-hidden rounded-lg mb-6 relative group">
              <img
                src={post.image}
                alt={post.title}
                className="object-cover w-full h-full transition-transform duration-300 transform group-hover:scale-105 group-hover:brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black opacity-40"></div>
            </div>

            <h3 className="text-xl font-semibold text-textdark group-hover:text-primary transition duration-200">
              {post.title}
            </h3>
            <p className="text-sm text-textmuted mt-4">{post.description}</p>

            <a
              href={post.link}
              className="mt-6 inline-block text-primary font-semibold hover:text-textdark transition duration-200"
            >
              Read Full Post →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BlogInsightsSection;
