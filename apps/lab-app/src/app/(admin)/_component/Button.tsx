// import React from 'react';

// interface ButtonProps {
//     text: string;
//     onClick: () => void;
//     className?: string;
//     type?: 'button' | 'submit' | 'reset';
//     disabled?: boolean;
//     }

// const Button = ({ text, onClick, className = '', type = 'button', disabled = false }: ButtonProps) => { 
//   return (
//     <button
//       type={type}
//       onClick={onClick}
//       className={`px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}
//       disabled={disabled}
//     >
//       {text}
//     </button>
//   );
// };

// export default Button;



import React from 'react';

interface ButtonProps {
    text: string;
    onClick: () => void;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    children?: React.ReactNode;
    }

const Button = ({ text, onClick, className = '', type = 'button', disabled = false, children }: ButtonProps) => {   
  return (
    <button
      type={type}
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}
      disabled={disabled}
    >
      {children}
      <span>{text}</span>
    </button>
  );
};

export default Button;
