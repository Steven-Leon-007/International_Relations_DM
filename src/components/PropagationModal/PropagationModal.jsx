import React from 'react';
import './PropagationModal.css';
import { FaExchangeAlt } from 'react-icons/fa';

const PropagationModal = ({ visible, changes, onClose, nodes }) => {
    if (!visible) return null;

    const getCountryData = (id) => {
        return nodes.find((n) => n.id === id);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Cambios propagados</h3>
                {changes.length === 0 ? (
                    <p>No se propagaron cambios.</p>
                ) : (
                    <ul className="change-list">
                        {changes.map((change, index) => {
                            const countryFrom = getCountryData(change.from);
                            const countryTo = getCountryData(change.to);

                            return (
                                <li key={index} className="change-item">
                                    <div className="flags-display">
                                        <div className="country-info">
                                            <img
                                                src={`https://flagcdn.com/w40/${countryFrom?.code.toLowerCase()}.png`}
                                                alt={`${countryFrom?.id} flag`}
                                                className="flag-icon"
                                            />
                                        </div>

                                        <FaExchangeAlt className="relation-icon" />

                                        <div className="country-info">
                                            <img
                                                src={`https://flagcdn.com/w40/${countryTo?.code.toLowerCase()}.png`}
                                                alt={`${countryTo?.id} flag`}
                                                className="flag-icon"
                                            />
                                        </div>
                                    </div>

                                    <div className="weight-change">
                                        <span>De: {change.oldWeight} a: {change.newWeight}</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
                <button onClick={onClose} className='close-button'>Cerrar</button>
            </div>
        </div>
    );
};

export default PropagationModal;
