import React, { useState, useEffect } from 'react';
import { FaSpinner, FaCircleNotch, FaRegSnowflake, FaAtom } from 'react-icons/fa';
import { GiSpinningSword, GiSpinningBlades } from 'react-icons/gi';
import { IoPlanet } from 'react-icons/io5';
import { motion } from 'framer-motion';

type LoaderSize = 'sm' | 'md' | 'lg' | 'xl';
type LoaderType =
  | 'spinner'
  | 'notch'
  | 'snowflake'
  | 'atom'
  | 'planet'
  | 'sword'
  | 'blades'
  | 'dots'
  | 'progress';

interface LoaderProps {
  type?: LoaderType;
  size?: LoaderSize;
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses: Record<LoaderSize, string> = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-5xl',
  xl: 'text-7xl'
};

const Loader: React.FC<LoaderProps> = ({
  type = 'spinner',
  size = 'md',
  text = 'Loading...',
  fullScreen = false
}) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (type === 'progress') {
      const interval = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 0 : prev + 5));
      }, 200);
      return () => clearInterval(interval);
    }
  }, [type]);

  const loaderVariants = {
    spin: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    },
    pulse: {
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.5,
        repeat: Infinity
      }
    },
    float: {
      y: ["0%", "-20%", "0%"],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return <FaSpinner className={`animate-spin ${sizeClasses[size]}`} />;
      case 'notch':
        return <FaCircleNotch className={`animate-spin ${sizeClasses[size]}`} />;
      case 'snowflake':
        return <motion.div variants={loaderVariants} animate="spin"><FaRegSnowflake className={sizeClasses[size]} /></motion.div>;
      case 'atom':
        return <motion.div variants={loaderVariants} animate="pulse"><FaAtom className={sizeClasses[size]} /></motion.div>;
      case 'planet':
        return <motion.div variants={loaderVariants} animate="float"><IoPlanet className={sizeClasses[size]} /></motion.div>;
      case 'sword':
        return <motion.div variants={loaderVariants} animate="spin"><GiSpinningSword className={sizeClasses[size]} /></motion.div>;
      case 'blades':
        return <motion.div variants={loaderVariants} animate="spin"><GiSpinningBlades className={sizeClasses[size]} /></motion.div>;
      case 'dots':
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-current rounded-full"
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        );
      case 'progress':
        return (
          <div className="w-64 bg-gray-200 rounded-full h-2.5">
            <motion.div 
              className="bg-blue-600 h-2.5 rounded-full" 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        );
      default:
        return <FaSpinner className={`animate-spin ${sizeClasses[size]}`} />;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? 'fixed inset-0 bg-black bg-opacity-50 z-50' : 'p-4'}`}>
      <div className="text-primary mb-2">
        {renderLoader()}
      </div>
      {text && (
        <motion.p 
          className="text-indigo-600 mt-2 font-medium"
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        >
          {text}
        </motion.p>
      )}
      {type === 'progress' && (
        <p className="text-indigo-600 mt-2 text-sm">{progress}%</p>
      )}
    </div>
  );
};

export default Loader;