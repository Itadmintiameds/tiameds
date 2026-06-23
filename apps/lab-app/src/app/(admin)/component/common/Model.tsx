'use client'
import { AnimatePresence, motion } from 'framer-motion';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    footer?: React.ReactNode;
    modalClassName?: string;
}

const Modal = ({ isOpen, onClose, children, title, footer, modalClassName }: ModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 8 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className={`relative z-10 bg-white rounded-xl shadow-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto ${modalClassName || 'max-w-2xl'}`}
                    >
                        {/* Header */}
                        {title && (
                            <div
                                className="px-6 py-4 border-b border-gray-200 relative overflow-hidden"
                                style={{ background: 'linear-gradient(135deg, #E1C4F8 0%, #d1a8f5 100%)' }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="bg-white/20 p-2 rounded-lg mr-3">
                                            <FaExclamationTriangle className="text-white text-lg" />
                                        </div>
                                        <h2 id="modal-title" className="text-lg font-semibold text-white">
                                            {title}
                                        </h2>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 focus:outline-none"
                                        aria-label="Close modal"
                                    >
                                        <FaTimes className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Body */}
                        <div id="modal-description" className="p-6">
                            {children}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
