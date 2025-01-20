'use client';

import { useState } from 'react';
import { blog } from "../data/blog";
import { Posttype } from "../types/post";
import { useRouter } from "next/navigation";

const BlogInsightsSection = () => {
  const blogPosts: Posttype[] = blog;
  const postsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(blogPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = blogPosts.slice(indexOfFirstPost, indexOfLastPost);

  const router = useRouter();

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleViewPost = (id: number) => {
    console.log(`View post with ID: ${id}`);
    router.push(`/blog/${id}`); // Redirects to the post page
    
  };

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
        {currentPosts.map((post, index) => (
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
            <button
               onClick={() => handleViewPost(post.id)}
              className="mt-6 inline-block text-primary font-semibold hover:text-textdark transition duration-200"
            >
              Read Full Post →
            </button>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-8 space-x-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-full bg-primary text-white shadow-md hover:bg-secondary hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center`}
        >
          <span className="text-lg">←</span>
        </button>
        <span className="px-4 py-2 text-textmuted">Page {currentPage} of {totalPages}</span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-full bg-primary text-white shadow-md hover:bg-secondary hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center`}
        >
          <span className="text-lg">→</span>
        </button>
      </div>
    </section>
  );
};

export default BlogInsightsSection;
