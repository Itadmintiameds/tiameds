"use client";

import { Dialog, DialogBackdrop, DialogTitle } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";

interface NewModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    footer?: React.ReactNode;
    modalClassName?: string;
}

const NewModal = ({
    isOpen,
    onClose,
    children,
    title,
    footer,
    modalClassName,
}: NewModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <Dialog
                    open={isOpen}
                    onClose={onClose}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                >
                    {/* Blur Backdrop */}
                    <DialogBackdrop
                        as={motion.div}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="
              fixed
              inset-0
              bg-black/10
              backdrop-blur-sm
            "
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.95,
                            y: 20,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.95,
                            y: 20,
                        }}
                        transition={{
                            duration: 0.2,
                            ease: "easeOut",
                        }}
                        className={`
              relative
              z-10
              w-full
              bg-white
              rounded-2xl
              shadow-[0_20px_60px_rgba(0,0,0,0.15)]
              overflow-hidden
              ${modalClassName || "max-w-2xl"}
            `}
                    >
                        {/* Header */}
                        {title && (
                            <div
                                className="
                  flex
                  items-center
                  justify-between
                  px-5
                  py-4
                  bg-info-200
                "
                            >
                                <div className="flex items-center gap-2">
                                    <Image
                                        src="/bandage.png"
                                        alt="Bandage"
                                        width={20}
                                        height={20}
                                        className="object-contain"
                                    />

                                    <DialogTitle className="text-h5 font-medium text-pneutral-900">
                                        {title}
                                    </DialogTitle>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="
                    rounded-md
                    p-1
                    text-[#2F2F2F]
                    transition-colors
                    hover:bg-black/5
                  "
                                    aria-label="Close modal"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        )}

                        {/* Body */}
                        <div className="p-5">
                            {children}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div
                                className="
                  border-t
                  border-gray-200
                  bg-white
                  px-5
                  py-4
                "
                            >
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </Dialog>
            )}
        </AnimatePresence>
    );
};

export default NewModal;