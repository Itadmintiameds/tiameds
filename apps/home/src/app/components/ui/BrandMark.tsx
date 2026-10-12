import Image from 'next/image';
import Link from 'next/link';

/** Header/footer lockup: the TiaMeds mark (inverted to white for the dark canvas) with the wordmark. */
export default function BrandMark({ className = '', onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className={`group inline-flex items-center gap-2.5 ${className}`} aria-label="TiaMeds — home">
      <Image
        src="/tiamed1.svg"
        alt=""
        width={36}
        height={36}
        unoptimized
        priority
        className="h-8 w-auto transition-transform duration-500 ease-out-quint [filter:brightness(0)_invert(1)] group-hover:-rotate-6"
      />
      <span className="text-[1.08rem] font-semibold tracking-[-0.03em] text-ink">TiaMeds</span>
    </Link>
  );
}
