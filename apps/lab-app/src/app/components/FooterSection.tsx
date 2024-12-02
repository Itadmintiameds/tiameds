import { FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import Image from 'next/image';


const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        {/* Footer Top */}
        <div className="flex justify-between items-center">
          <div>
          <Image src="/tiamed2.svg" alt="Lab Management Logo" width={100} height={100} /> 
          </div>
          <div>
            <ul className="flex space-x-8">
              <li>
                <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors duration-300">About</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors duration-300">Privacy</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors duration-300">Terms</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="mt-8 flex justify-center space-x-6">
          <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors duration-300">
            <FaFacebook size={24} />
          </a>
          <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors duration-300">
            <FaTwitter size={24} />
          </a>
          <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors duration-300">
            <FaLinkedin size={24} />
          </a>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 text-center text-gray-500">
          <p>&copy; 2024 Your Brand. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
