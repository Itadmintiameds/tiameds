'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  children?: React.ReactNode;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  children
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Dialog box */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
          width: '100%',
          maxWidth: '540px',
          maxHeight: 'calc(100vh - 32px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            background: 'linear-gradient(135deg, #E1C4F8 0%, #d1a8f5 100%)',
            borderBottom: '1px solid #e5e7eb',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '8px',
                  borderRadius: '8px',
                  marginRight: '12px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <FaExclamationTriangle style={{ color: 'white', fontSize: '18px' }} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'white', margin: 0 }}>{title}</h3>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              style={{
                color: 'rgba(255,255,255,0.8)',
                padding: '6px',
                borderRadius: '6px',
                border: 'none',
                background: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <FaTimes style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: '1 1 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ flexShrink: 0, marginRight: '16px' }}>
              <div
                style={{
                  backgroundColor: '#f3e8ff',
                  padding: '12px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <FaCheckCircle style={{ color: '#a855f7', fontSize: '20px' }} />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#374151', lineHeight: '1.6', margin: 0, fontSize: '14px' }}>{message}</p>
              {children && (
                <div
                  style={{ marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}
                >
                  {children}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              paddingTop: '16px',
              borderTop: '1px solid #f3f4f6',
            }}
          >
            <button
              onClick={onClose}
              disabled={isLoading}
              style={{
                padding: '8px 18px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              style={{
                padding: '8px 18px',
                fontSize: '14px',
                fontWeight: 500,
                color: 'white',
                background: isLoading
                  ? '#9CA3AF'
                  : 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                borderRadius: '8px',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {isLoading ? (
                <>
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  Processing...
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  {confirmText}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationDialog;
