import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ onClick, children, variant = 'primary' }) => {
  const baseClasses = 'px-6 py-2.5 font-bold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-emerald-300 text-emerald-950 hover:bg-emerald-400 focus:ring-emerald-300',
    secondary: 'bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-100 focus:ring-slate-300', 
  };
  
  return (
    <button onClick={onClick} className={`${baseClasses} ${variants[variant]}`}>
      {children}
    </button>
  );
};

export default Button;
