/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
          {
            source: '/lab',
            destination: 'https://tiameds-lab-app.vercel.app', // Proxy to the lab app
          },
          
        ];
      },
}

export default nextConfig;
