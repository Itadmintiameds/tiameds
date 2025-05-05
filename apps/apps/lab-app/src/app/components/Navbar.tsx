
'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
    return (
        <motion.nav
            className="absolute top-0 left-0 w-full p-6 text-white flex justify-between items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
            >

                <Image
                    src="/tiamed.svg"
                    alt=""
                    width={100}
                    height={100}
                    className="bg-indigo-900"
                />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
            >
                {/* Sign In Button */}
                <Link href="/signin">
                    <button className="bg-white text-purple-600 px-6 py-2 rounded-lg text-lg font-semibold hover:bg-gray-100 transition duration-200">
                        Sign In
                    </button>
                </Link>
            </motion.div>
        </motion.nav>
    );
};

export default Navbar;
