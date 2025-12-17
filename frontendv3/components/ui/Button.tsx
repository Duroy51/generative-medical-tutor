import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    isLoading?: boolean;
}

export function Button({ children, variant = 'primary', isLoading, className, ...props }: ButtonProps) {

    const baseStyle = "w-full py-3 px-6 rounded-full font-bold transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed";


    const variants = {
        primary: "bg-brand-primary hover:bg-brand-primaryHover text-white shadow-lg hover:shadow-xl transform active:scale-95",
        outline: "border-2 border-gray-300 text-gray-700 hover:border-brand-primary hover:text-brand-primary bg-transparent",
        ghost: "bg-transparent text-brand-primary hover:bg-brand-primary/10"
    };

    return (
        <button
            className={`${baseStyle} ${variants[variant]} ${className || ''}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : children}
        </button>
    );
}