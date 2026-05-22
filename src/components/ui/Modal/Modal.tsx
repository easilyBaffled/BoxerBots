import React from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  title: string;
  onClose?: () => void;
  children: React.ReactNode;
  wide?: boolean;
}

export function Modal({ title, onClose, children, wide }: ModalProps) {
  return (
    <div className={styles.overlay}>
      <div className={`${styles.modal} ${wide ? styles.wide : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          {onClose && (
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          )}
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
