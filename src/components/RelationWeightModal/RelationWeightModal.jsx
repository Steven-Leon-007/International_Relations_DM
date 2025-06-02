import React from 'react';
import RelationSlider from './RelationSlider';
import './RelationWeightModal.css';
import { FaExchangeAlt } from "react-icons/fa";

const RelationWeightModal = ({ visible, value, onChange, onClose, onSave, countries }) => {
  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Editar peso de la relación</h3>
        <div className="related-countries">
          {countries.length === 2 && (
            <>
              <div className="country-info">
                <img
                  src={`https://flagcdn.com/w40/${countries[0].code.toLowerCase()}.png`}
                  alt={`${countries[0].id} flag`}
                  className="flag-icon"
                />
                <span>{countries[0].id}</span>
              </div>

              <FaExchangeAlt className="relation-icon"/>

              <div className="country-info">
                <img
                  src={`https://flagcdn.com/w40/${countries[1].code.toLowerCase()}.png`}
                  alt={`${countries[1].id} flag`}
                  className="flag-icon"
                />
                <span>{countries[1].id}</span>
              </div>
            </>
          )}
        </div>
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
