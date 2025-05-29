import React from 'react';
import './RelatedCountriesModal.css';

const RelatedCountriesModal = ({ visible, countries, onClose, onShowOnMap, selectedCountry }) => {
  if (!visible) return null;  
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Países relacionados</h3>
        <ul className="countries-list">
          {countries.filter(country => country.id!=selectedCountry).map(country => (
            <li key={country.id} className="country-item">
              <img
                src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                alt={`${country.id} flag`}
                className="flag-icon"
              />
              <span>{country.id}</span>
            </li>
          ))}
        </ul>
        <div className='btn-container'>
          <button onClick={onClose} className="btn">Cerrar</button>
          <button onClick={() => {
              onClose();    
              onShowOnMap();
            }} className="btn">Ver en el mapa</button>
        </div>
      </div>
    </div>
  );
};

export default RelatedCountriesModal;
