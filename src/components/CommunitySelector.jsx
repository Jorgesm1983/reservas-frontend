import React, { useEffect, useState } from 'react';
import { fetchComunidades } from '../services/ApiService';

export default function CommunitySelector({ selectedCommunity, setSelectedCommunity }) {
  const [comunidades, setComunidades] = useState([]);

  useEffect(() => {
    fetchComunidades().then(res => {
      setComunidades(res.data.results); 
    });
  }, []);

return (
    <div className="selector-comunidad-container">
      <select
        className="selector-comunidad"
        value={selectedCommunity?.id || ''}
        onChange={(e) => {
          const selected = comunidades.find(c => c.id === parseInt(e.target.value));
          setSelectedCommunity(selected || null);
        }}
      >
        <option value="">Seleccionar comunidad</option>
        {comunidades.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </div>
  );
}
