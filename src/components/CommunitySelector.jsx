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
    <select 
      className="form-select" 
      value={selectedCommunity} 
      onChange={(e) => setSelectedCommunity(e.target.value)}
      style={{ maxWidth: 200 }}
    >
      <option value="">Todas las comunidades</option>
      {comunidades.map(c => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  );
}
