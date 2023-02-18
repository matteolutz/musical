import './style.css';

import React, { type FC, type PropsWithChildren, useEffect } from 'react';

type ModalComponentProps = PropsWithChildren & {
  title: string;
  closeModal: () => void;
};

const ModalComponent: FC<ModalComponentProps> = ({
  children,
  title,
  closeModal
}) => {
  const handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    closeModal();
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="modal__container">
      <div className="modal__box">
        <div className="modal__header">
          <h3 className="modal__header__title">{title}</h3>
          <button type="button" onClick={closeModal}>
            &times;
          </button>
        </div>
        <div className="modal__content">{children}</div>
      </div>
    </div>
  );
};

export default ModalComponent;
