'use client'
import { Dialog, DialogBackdrop, DialogTitle } from '@headlessui/react';
import { motion } from "framer-motion";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    footer?: React.ReactNode;
    modalClassName?: string; // Add the new prop for custom classes
}

const Modal = ({ isOpen, onClose, children, title, footer, modalClassName }: ModalProps) => {
    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            aria-labelledby="modal-title" 
            aria-describedby="modal-description"
        >
            {/* Backdrop */}
            <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-50" />

            {/* Modal Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`relative z-10 bg-white rounded-xl shadow-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto ${modalClassName || 'max-w-2xl'}`}
            >
                {/* Header with gradient background */}
                {title && (
                    <div 
                        className="px-6 py-4 border-b border-gray-200 relative overflow-hidden"
                        style={{
                            background: `linear-gradient(135deg, #E1C4F8 0%, #d1a8f5 100%)`
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="bg-white/20 p-2 rounded-lg mr-3">
                                    <FaExclamationTriangle className="text-white text-lg" />
                                </div>
                    <DialogTitle
                        id="modal-title"
                                    className="text-lg font-semibold text-white"
                    >
                        {title}
                    </DialogTitle>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white/80 hover:text-white transition-colors disabled:opacity-50 p-1 rounded-lg hover:bg-white/10 focus:outline-none"
                                aria-label="Close modal"
                            >
                                <FaTimes className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Modal Body */}
                <div
                    id="modal-description"
                    className="p-6"
                >
                    {children}
                </div>

                {/* Modal Footer */}
                {footer && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        {footer}
                    </div>
                )}
            </motion.div>
        </Dialog>
    );
};

export default Modal;

