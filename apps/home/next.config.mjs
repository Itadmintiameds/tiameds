/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
            source: '/lab',
            destination: 'https://tiameds-lab-q3ta6zvgv-abhishek-kumars-projects-7cc8d4a1.vercel.app/',
          },
      ];
    },
  };
  
  export default nextConfig;
  