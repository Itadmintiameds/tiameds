import React, { ReactNode } from "react";

interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  closeModal: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, isOpen, closeModal }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={closeModal}
    >
      <div
        className="w-auto rounded-lg shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevent modal close on click inside modal
      >
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
