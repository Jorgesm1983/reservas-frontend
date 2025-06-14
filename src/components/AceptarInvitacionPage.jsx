import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API } from '../services/ApiService';
import Header from '../components/Header';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function AceptarInvitacionPage() {
  const { token } = useParams();
  const [, setEstado] = useState('cargando');

  useEffect(() => {
    toast.dismiss('inv-aceptada');
    API.get(`invitaciones/${token}/aceptar/`)
      .then(res => {
        const msg = res.data.detail;
        if (msg === "Invitación aceptada correctamente.") {
          toast.success(msg, { toastId: 'inv-aceptada', autoClose: false, closeButton: false });
          setEstado('aceptada');
        } else if (msg === "La invitación ya fue aceptada.") {
          toast.info(msg, { toastId: 'inv-aceptada', autoClose: false, closeButton: false });
          setEstado('ya-aceptada');
        } else {
          toast.error(msg, { toastId: 'inv-aceptada', autoClose: false, closeButton: false });
          setEstado('error');
        }
      })
      .catch(() => {
        toast.error('No se pudo aceptar la invitación. Puede que ya haya sido aceptada o que el enlace no sea válido.', { toastId: 'inv-aceptada', autoClose: false, closeButton: false });
        setEstado('error');
      });
  }, [token]);

  return (
    <div style={{background: "#f6f8fa" }}>
      <Header showHomeIcon={true} showLogout={false} />
      <ToastContainer
        position="top-center"
        autoClose={false}
        closeButton={false}
        hideProgressBar
        draggable={false}
        newestOnTop
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        }}
      />
    </div>
  );
}
