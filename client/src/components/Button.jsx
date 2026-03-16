import React from "react";

const Button = ({ text, className, onClick }) => {
    return (
        <button onClick={onClick} className={`px-3 py-2 rounded-md font-medium ${className}`}>
            {text}
        </button>
    );
};

export default Button;