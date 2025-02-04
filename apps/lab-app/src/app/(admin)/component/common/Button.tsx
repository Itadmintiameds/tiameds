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
      className={`flex items-center  px-4 py-2  text-white   disabled:cursor-not-allowed ${className}`}
      disabled={disabled}
    >
      {children}
      <span>{text}</span>
    </button>
  );
};

export default Button;
