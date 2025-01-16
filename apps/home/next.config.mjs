/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
            source: '/lab/_next/:path*',
            destination: 'https://tiameds-lab-app.vercel.app/_next/:path*',
          },
      ];
    },
  };
  
  export default nextConfig;
  