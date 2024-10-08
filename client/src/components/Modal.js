import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import './Modal.css';

const Modal = ({ isOpen, onClose, onLogin }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="modal-close-button" onClick={onClose}>
          <X size={20} />
        </button>
        <h2>Please Log in or Sign up</h2>
        <p>You need to be logged in to complete this action</p>
        <div className="modal-actions">
          <button className="button" onClick={onLogin}>
            Login/Signup
          </button>
          <button className="button back-buttonback" onClick={onClose}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
