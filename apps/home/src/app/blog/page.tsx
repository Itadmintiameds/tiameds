// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { BsEyeFill } from 'react-icons/bs';
// import { useRouter } from 'next/router'
 

// interface Post {
//   id: number;
//   title: string;
//   href: string;
//   description: string;
//   date: string;
//   datetime: string;
//   category: { title: string; href: string };
//   author: {
//     name: string;
//     role: string;
//     href: string;
//     imageUrl: string;
//   };
// }

// const posts: Post[] = [
//   {
//     id: 1,
//     title: 'Empowering the future of healthcare',
//     href: '/product',
//     description:
//       'At Tiameds Technology, we deliver secure, scalable, and efficient SaaS solutions for the healthcare industry—helping you achieve better outcomes for patients and providers.',
//     date: 'Mar 16, 2020',
//     datetime: '2020-03-16',
//     category: { title: 'Healthcare Innovation', href: '/product' },
//     author: {
//       name: 'Michael Foster',
//       role: 'Co-Founder / CTO',
//       href: '#',
//       imageUrl:
//         'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
//     },
//   },
//   {
//     id: 2,
//     title: 'Healthcare Innovation at its Best',
//     href: '/innovation',
//     description:
//       'Discover cutting-edge solutions transforming the healthcare industry with our advanced technology.',
//     date: 'Apr 10, 2021',
//     datetime: '2021-04-10',
//     category: { title: 'Innovation Insights', href: '/innovation' },
//     author: {
//       name: 'Sarah Connor',
//       role: 'Lead Developer',
//       href: '#',
//       imageUrl:
//         'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
//     },
//   },

//   // More posts...
// ];

// export default function Page() {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const postsPerPage = 5;
//   const router = useRouter();

//   const filteredPosts = posts.filter(
//     (post) =>
//       post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       post.description.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
//   const indexOfLastPost = currentPage * postsPerPage;
//   const indexOfFirstPost = indexOfLastPost - postsPerPage;
//   const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

//   const handleNextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   const handlePrevPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   const handleViewPost = (id: number) => {
//     console.log(`View post with ID: ${id}`); // Logs the post ID correctly
//     router.push(`/blog/${id}`); // Redirects to the post page
    
//   };

//   return (
//     <div className="relative isolate bg-white py-24 sm:py-32">
//       <div
//         aria-hidden="true"
//         className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 animate-gradient-flow"
//       >
//         <div
//           style={{
//             clipPath:
//               'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
//           }}
//           className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
//         />
//       </div>
//       <div className="mx-auto max-w-7xl px-6 lg:px-8">
//         <div className="mx-auto max-w-2xl">
//           <h2 className="text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">From the blog</h2>
//           <p className="mt-2 text-lg/8 text-gray-600">Learn more about our latest insights and innovations in healthcare technology.</p>

//           <input
//             type="text"
//             placeholder="Search posts..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="mt-4 mb-6 w-full rounded-lg border border-gray-300 p-2 text-sm text-gray-900"
//           />

//           <div className="mt-10 space-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16">
//             {currentPosts.map((post) => (
//               <article key={post.id} className="flex max-w-xl flex-col items-start justify-between">
//                 <div className="flex items-center gap-x-4 text-xs">
//                   <time dateTime={post.datetime} className="text-gray-500">
//                     {post.date}
//                   </time>
//                   <Link 
//                     href={post.category.href}
//                     className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"
//                   >
//                     {post.category.title}
//                   </Link>
//                 </div>
//                 <div className="group relative">
//                   <h3 className="mt-3 text-lg/6 font-semibold text-gray-900 group-hover:text-gray-600">
//                     <p  onClick={() => handleViewPost(post.id)} className="cursor-pointer link">
//                       <span className="absolute inset-0" />
//                       {post.title}
//                     </p>
//                   </h3>
//                   <p className="mt-5 line-clamp-3 text-sm/6 text-gray-600">{post.description}</p>
//                 </div>
//                 <div className="relative mt-8 flex items-center gap-x-4 justify-between w-full">
//                   <img alt={post.author.name} src={post.author.imageUrl} className="h-10 w-10 rounded-full bg-gray-50" />
//                   <div className="text-sm/6">
//                     <p className="font-semibold text-gray-900">
//                       <Link href={post.author.href}>
//                         <span className="absolute inset-0" />
//                         {post.author.name}
//                       </Link>
//                     </p>
//                     <p className="text-gray-600">{post.author.role}</p>
//                   </div>
//                   {/* <BsEyeFill
//                     className="ml-auto text-primary cursor-pointer"
//                     onClick={() => handleViewPost(post.id)} // Calls the handler with post ID
//                   /> */}
//                 </div>
//               </article>
//             ))}
//           </div>

//           <div className="mt-6 flex justify-between">
//             <button
//               onClick={handlePrevPage}
//               disabled={currentPage === 1}
//               className="rounded bg-primary px-4 py-2 text-sm text-white disabled:opacity-10"
//             >
//               Previous
//             </button>
//             <p className="text-sm text-gray-700">
//               Page {currentPage} of {totalPages}
//             </p>
//             <button
//               onClick={handleNextPage}
//               disabled={currentPage === totalPages}
//               className="rounded bg-primary px-4 py-2 text-sm text-white disabled:opacity-10"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }






'use client';

import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useState } from 'react';

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
    router.push(`/blog/${id}`); // Redirects to the post page
    
  };

  return (
    <div className="relative isolate bg-white py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 animate-gradient-flow"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        />
      </div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">From the blog</h2>
          <p className="mt-2 text-lg/8 text-gray-600">Learn more about our latest insights and innovations in healthcare technology.</p>

          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-4 mb-6 w-full rounded-lg border border-gray-300 p-2 text-sm text-gray-900"
          />

          <div className="mt-10 space-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16">
            {currentPosts.map((post) => (
              <article key={post.id} className="flex max-w-xl flex-col items-start justify-between">
                <div className="flex items-center gap-x-4 text-xs">
                  <time dateTime={post.datetime} className="text-gray-500">
                    {post.date}
                  </time>
                  <Link 
                    href={post.category.href}
                    className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"
                  >
                    {post.category.title}
                  </Link>
                </div>
                <div className="group relative">
                  <h3 className="mt-3 text-lg/6 font-semibold text-gray-900 group-hover:text-gray-600">
                    <p  onClick={() => handleViewPost(post.id)} className="cursor-pointer link">
                      <span className="absolute inset-0" />
                      {post.title}
                    </p>
                  </h3>
                  <p className="mt-5 line-clamp-3 text-sm/6 text-gray-600">{post.description}</p>
                </div>
                <div className="relative mt-8 flex items-center gap-x-4 justify-between w-full">
                  <img alt={post.author.name} src={post.author.imageUrl} className="h-10 w-10 rounded-full bg-gray-50" />
                  <div className="text-sm/6">
                    <p className="font-semibold text-gray-900">
                      <Link href={post.author.href}>
                        <span className="absolute inset-0" />
                        {post.author.name}
                      </Link>
                    </p>
                    <p className="text-gray-600">{post.author.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="rounded bg-primary px-4 py-2 text-sm text-white disabled:opacity-10"
            >
              Previous
            </button>
            <p className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </p>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="rounded bg-primary px-4 py-2 text-sm text-white disabled:opacity-10"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
