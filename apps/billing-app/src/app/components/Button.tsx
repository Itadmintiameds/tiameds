interface ButtonProps {
    onClick: () => void; // Function type
    children: React.ReactNode; // Allows text or elements inside the button
    className?: string; // Optional additional class names
  }
  
  const Button: React.FC<ButtonProps> = ({ onClick, children, className = "" }) => {
    return (
      <button className={`button ${className}`} onClick={onClick}>
        {children}
      </button>
    );
  };
  
  export default Button;
  