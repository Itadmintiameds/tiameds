/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
          {
            source: '/lab/:path*',
            destination: 'https://tiameds-lab-app.vercel.app/:path*', // Proxy to the lab app
          },
          
        ];
      },
}

export default nextConfig;
