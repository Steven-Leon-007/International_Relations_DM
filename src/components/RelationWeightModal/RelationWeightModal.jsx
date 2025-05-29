import React from 'react';
import RelationSlider from './RelationSlider';
import './RelationWeightModal.css';

const RelationWeightModal = ({ visible, value, onChange, onClose, onSave }) => {
  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Editar peso de la relación</h3>
        <RelationSlider value={value} onChange={onChange} />
        <div className="modal-buttons">
          <button onClick={onClose}>Cancelar</button>
          <button onClick={onSave}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default RelationWeightModal;
