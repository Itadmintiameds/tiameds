'use client'

import { Dialog, DialogBackdrop } from '@headlessui/react';
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    footer?: React.ReactNode;
}

const Modal = ({ isOpen, onClose, children, title, footer }: ModalProps) => {
    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            className="fixed inset-0 z-30 flex items-center justify-center "
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            {/* Backdrop */}
            <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative z-10 w-full max-w-lg p-6 bg-white rounded-lg shadow-xl"
            >
                {/* Close Button */}
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-500 text-2xl hover:text-gray-700 focus:outline-none"
                    aria-label="Close modal"
                >
                    <IoMdClose size={24} />
                </button>


                {/* Modal Title */}
                {title && (
                    <Dialog.Title
                        id="modal-title"
                        className="mb-4 text-lg font-semibold text-gray-900"
                    >
                        {title}
                    </Dialog.Title>
                )}

                {/* Modal Body */}
                <div
                    id="modal-description"
                    className="text-gray-700 bg-white rounded-md shadow-sm bg-white"
                >
                    {children}
                </div>

                {/* Modal Footer */}
                {footer && <div className="mt-4 border-t pt-4">{footer}</div>}
            </motion.div>
        </Dialog>
    );
};

export default Modal;

