

import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity p-4"
            onClick={onClose}
        >
            <div
                className={`bg-card dark:bg-dark-card rounded-lg shadow-xl w-full transform transition-all overflow-hidden flex flex-col ${className || 'max-w-sm'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};

export default Modal;