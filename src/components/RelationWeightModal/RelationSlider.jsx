import React from 'react';

const RelationSlider = ({ value, onChange }) => {
  return (
    <div>
      <input
        type="range"
        min={-10}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%' }}
      />
      <label style={{ display: 'block', textAlign: 'center', marginTop: '8px' }}>
        Valor: {value}
      </label>
    </div>
  );
};

export default RelationSlider;
