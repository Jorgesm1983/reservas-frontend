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
    toast.dismiss('inv-rechazada');
    API.get(`invitaciones/${token}/rechazar/`)
      .then(res => {
        const msg = res.data.detail;
        if (msg === "Invitación rechazada correctamente.") {
          toast.success(msg, { toastId: 'inv-rechazada', autoClose: false, closeButton: false });
          setEstado('rechazada');
        } else if (msg === "La invitación ya fue rechazada.") {
          toast.info(msg, { toastId: 'inv-rechazada', autoClose: false, closeButton: false });
          setEstado('ya-rechazada');
        } else {
          toast.error(msg, { toastId: 'inv-rechazada', autoClose: false, closeButton: false });
          setEstado('error');
        }
      })
      .catch(() => {
        toast.error('No se pudo rechazar la invitación. Puede que ya haya sido rechazada o que el enlace no sea válido.', { toastId: 'inv-rechazada', autoClose: false, closeButton: false });
        setEstado('error');
      });
  }, [token]);

  return (
    <div style={{ background: "#f6f8fa" }}>
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
