'use client';

import { useRouter } from "next/navigation";
import { useState } from 'react';
import PostList from '../components/PostList';
import PageHero from '../components/ui/PageHero';
import { blog } from '../data/blog';
import { Posttype } from '../types/post';


const posts: Posttype[] = blog;

const Page = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;
  const router = useRouter();  // useRouter should be used directly here

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleViewPost = (id: number) => {
    console.log(`View post with ID: ${id}`);
    router.push(`/blog/${id}`); // Redirects to the post page

  };

  return (
    <>
      <PageHero
        eyebrow="Insights"
        title="From the *blog*"
        lede="Learn more about our latest insights and innovations in healthcare technology."
      />
      <section className="section border-t border-edge/10 pt-14">
        <div className="container-x">
          <PostList
            posts={currentPosts}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            onView={handleViewPost}
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={handlePrevPage}
            onNext={handleNextPage}
          />
        </div>
      </section>
    </>
  );
}

export default Page;
