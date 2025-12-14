import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'action';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-6 py-2 rounded-lg font-bold font-sans tracking-wide transform transition hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-md";
  
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-300",
    secondary: "bg-slate-600 hover:bg-slate-500 text-white shadow-slate-300",
    danger: "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-300",
    action: "bg-sky-400 hover:bg-sky-300 text-white text-lg shadow-sky-200",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};