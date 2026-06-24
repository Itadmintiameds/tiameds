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
                <div
                    className="fixed inset-0 z-50 p-2 sm:p-4"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
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
                        className={`relative z-10 bg-white rounded-xl shadow-2xl w-full ${modalClassName || 'max-w-2xl'}`}
                        style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: '90vh' }}
                    >
                        {/* Header — sticky, never scrolls */}
                        {title && (
                            <div
                                className="px-6 py-4 relative overflow-hidden"
                                style={{
                                    background: 'linear-gradient(135deg, #E1C4F8 0%, #d1a8f5 100%)',
                                    flexShrink: 0,
                                    borderBottom: '1px solid #e5e7eb',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
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

                        {/* Body — only this scrolls */}
                        <div
                            id="modal-description"
                            className="p-4 sm:p-6"
                            style={{ flex: '1 1 0%', overflowY: 'auto', minHeight: 0 }}
                        >
                            {children}
                        </div>

                        {/* Footer — sticky, never scrolls */}
                        {footer && (
                            <div
                                className="px-6 py-4 bg-gray-50"
                                style={{ flexShrink: 0, borderTop: '1px solid #e5e7eb' }}
                            >
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
