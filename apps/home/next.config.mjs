/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/lab/:path*',
          destination: 'https://tiameds-lab-app.vercel.app/:path*', // Ensure dynamic paths are proxied
        },
        {
          source: '/bill/:path*',
          destination: 'https://tiameds-bill-app.vercel.app/:path*',
        },
      ];
    },
  };
  
  export default nextConfig;
  