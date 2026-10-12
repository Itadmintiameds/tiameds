'use client';

import { useRouter } from "next/navigation";
import { useState } from 'react';
import PostList from '../components/PostList';
import PageHero from '../components/ui/PageHero';

interface Post {
  id: number;
  title: string;
  href: string;
  description: string;
  date: string;
  datetime: string;
  category: { title: string; href: string };
  author: {
    name: string;
    role: string;
    href: string;
    imageUrl: string;
  };
}

const posts: Post[] = [
  {
    id: 1,
    title: 'Empowering the future of healthcare',
    href: '/product',
    description:
      'At Tiameds Technology, we deliver secure, scalable, and efficient SaaS solutions for the healthcare industry—helping you achieve better outcomes for patients and providers.',
    date: 'Mar 16, 2020',
    datetime: '2020-03-16',
    category: { title: 'Healthcare Innovation', href: '/product' },
    author: {
      name: 'Michael Foster',
      role: 'Co-Founder / CTO',
      href: '#',
      imageUrl:
        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
  {
    id: 2,
    title: 'Healthcare Innovation at its Best',
    href: '/innovation',
    description:
      'Discover cutting-edge solutions transforming the healthcare industry with our advanced technology.',
    date: 'Apr 10, 2021',
    datetime: '2021-04-10',
    category: { title: 'Innovation Insights', href: '/innovation' },
    author: {
      name: 'Sarah Connor',
      role: 'Lead Developer',
      href: '#',
      imageUrl:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
  // More posts...
];

export default function Page() {
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
    router.push(`/casestudies/${id}`); // Redirects to the post page

  };

  return (
    <>
      <PageHero eyebrow="Case Studies" title="From the *Case Studies*" lede="Learn how we help businesses grow" />
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
