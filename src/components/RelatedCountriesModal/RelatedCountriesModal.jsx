import React from 'react';
import graphData from '../../assets/graphData.json';
import './RelatedCountriesModal.css';

const RelatedCountriesModal = ({ visible, node, onClose, onViewOnMap }) => {
  if (!visible || !node) return null;

  const { nodes, edges } = graphData;

  const relatedEdges = edges.filter(edge => edge.from === node.id || edge.to === node.id);

  const relatedCountries = relatedEdges.map(edge => {
    const otherId = edge.from === node.id ? edge.to : edge.from;
    return nodes.find(n => n.id === otherId);
  }).filter(Boolean);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Países relacionados con {node.id}</h3>
        <ul className="countries-list">
          {relatedCountries.map(country => (
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
          <button onClick={() => onViewOnMap(node)} className="btn btn-view">Ver en mapa</button>
        </div>
      </div>
    </div>
  );
};

export default RelatedCountriesModal;
