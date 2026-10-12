'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Search } from './ui/icons';

export interface ListPost {
  id: number;
  title: string;
  description: string;
  date: string;
  datetime: string;
  category: { title: string; href: string };
  author: { name: string; role: string; href: string; imageUrl: string };
}

function Avatar({ src, name }: { src: string; name: string }) {
  if (!src || src === '#') {
    const initials = name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    return (
      <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-edge/15 text-xs font-medium text-mute">
        {initials}
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={name} src={src} loading="lazy" className="h-10 w-10 shrink-0 rounded-full object-cover" />;
}

export interface PostListProps {
  posts: ListPost[];
  searchTerm: string;
  onSearch: (value: string) => void;
  onView: (id: number) => void;
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

/** Presentation for the blog and case-study lists; the pages keep their own search/pagination logic. */
export default function PostList({ posts, searchTerm, onSearch, onView, currentPage, totalPages, onPrev, onNext }: PostListProps) {
  return (
    <div>
      <div className="relative max-w-md">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint" />
        <label htmlFor="post-search" className="sr-only">
          Search posts
        </label>
        <input
          id="post-search"
          type="text"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          className="field rounded-full pl-11"
        />
      </div>

      <ul className="mt-10 hairline-list">
        {posts.map((post) => (
          <li key={post.id} className="group relative grid gap-5 py-9 md:grid-cols-12 md:gap-8">
            <div className="flex flex-wrap items-center gap-3 md:col-span-3 md:flex-col md:items-start">
              <time dateTime={post.datetime} className="mono-num text-xs text-faint">
                {post.date}
              </time>
              <Link href={post.category.href} className="chip relative z-10 transition-colors hover:border-edge/40 hover:text-ink">
                {post.category.title}
              </Link>
            </div>
            <div className="md:col-span-6">
              <h3 className="text-[clamp(1.35rem,2.2vw,1.75rem)] font-medium leading-snug tracking-[-0.03em] transition-colors duration-300 group-hover:text-signal">
                <button type="button" onClick={() => onView(post.id)} className="text-left after:absolute after:inset-0 after:content-['']">
                  {post.title}
                </button>
              </h3>
              <p className="mt-3 line-clamp-3 text-mute">{post.description}</p>
            </div>
            <div className="flex items-center gap-3 md:col-span-3 md:justify-end">
              <Avatar src={post.author.imageUrl} name={post.author.name} />
              <div className="text-sm">
                <p className="font-medium text-ink">
                  <Link href={post.author.href} className="relative z-10 hover:text-signal">
                    {post.author.name}
                  </Link>
                </p>
                <p className="text-faint">{post.author.role}</p>
              </div>
            </div>
          </li>
        ))}
        {posts.length === 0 && <li className="py-12 text-mute">No posts match “{searchTerm}”.</li>}
      </ul>

      <div className="mt-10 flex items-center justify-between gap-4">
        <button onClick={onPrev} disabled={currentPage === 1} className="btn btn-ghost">
          <ArrowLeft size={16} />
          <span>Previous</span>
        </button>
        <p className="mono-num text-sm text-mute">
          Page {currentPage} of {totalPages}
        </p>
        <button onClick={onNext} disabled={currentPage === totalPages} className="btn btn-ghost">
          <span>Next</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
