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
      value={selectedCommunity || ''}
      onChange={e => {
    console.log('[SELECTOR] Nuevo valor:', e.target.value, typeof e.target.value);
    setSelectedCommunity(e.target.value || '');
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

// import React, { useEffect, useState } from 'react';
// import { fetchComunidades } from '../services/ApiService';
// import { useCommunity } from '../context/CommunityContext';

// export default function CommunitySelector() {
//   const [comunidades, setComunidades] = useState([]);
//   const { selectedCommunity, setSelectedCommunity, user } = useCommunity();

//   useEffect(() => {
//     fetchComunidades().then(res => {
//       setComunidades(res.data.results);
//     });
//   }, []);

//   if (user === null) return null;
//   if (!user.is_staff) return null;

//   return (
//     <div className="selector-comunidad-container">
//       <select
//         className="selector-comunidad"
//         value={selectedCommunity || ''}
//         onChange={e => setSelectedCommunity(e.target.value || '')}
//       >
//         <option value="">Seleccionar comunidad</option>
//         {comunidades.map(c => (
//           <option key={c.id} value={c.id}>{c.name}</option>
//         ))}
//       </select>
//     </div>
//   );
// }
