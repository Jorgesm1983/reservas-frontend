import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API } from '../services/ApiService';
import Header from '../components/Header';
import { ToastContainer, toast } from 'react-toastify';
import { Spinner } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';

export default function RechazarInvitacionPage() {
  const { token } = useParams();
  const [estado, setEstado] = useState('cargando'); // 'cargando', 'rechazada', 'ya-rechazada', 'error'
  const [mensaje, setMensaje] = useState("Procesando invitación...");
  const navigate = useNavigate();

  useEffect(() => {
    toast.dismiss('inv-rechazada');
    API.get(`api/invitaciones/${token}/rechazar/`)
      .then(res => {
        const msg = res.data.detail;
        setMensaje(msg);
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
        const errMsg = 'No se pudo rechazar la invitación. Puede que ya haya sido rechazada o que el enlace no sea válido.';
        toast.error(errMsg, { toastId: 'inv-rechazada', autoClose: false, closeButton: false });
        setMensaje(errMsg);
        setEstado('error');
      });
  }, [token]);

  // Icono y título según estado
  let icono, titulo;
  if (estado === "rechazada") {
    icono = <i className="bi bi-check-circle-fill text-success" style={{ fontSize: 32, verticalAlign: "middle" }}></i>;
    titulo = "Invitación rechazada";
  } else if (estado === "ya-rechazada") {
    icono = <i className="bi bi-info-circle-fill text-info" style={{ fontSize: 32, verticalAlign: "middle" }}></i>;
    titulo = "Invitación ya rechazada";
  } else if (estado === "error") {
    icono = <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: 32, verticalAlign: "middle" }}></i>;
    titulo = "Error al rechazar invitación";
  } else {
    icono = <i className="bi bi-info-circle-fill text-info" style={{ fontSize: 32, verticalAlign: "middle" }}></i>;
    titulo = "Procesando invitación";
  }

  return (
    <div style={{ background: "#f6f8fa", minHeight: "100vh" }}>
      <Header showHomeIcon={true} showLogout={false} />
      <div className="container d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
        <div className={`alert alert-${estado === "rechazada" ? "success" : estado === "ya-rechazada" ? "info" : estado === "error" ? "danger" : "info"} shadow-lg text-center`} style={{ maxWidth: 420 }}>
          <h4 className="mb-3">
            {icono}
            <span className="ms-2">{titulo}</span>
          </h4>
          <p className="mb-0">{mensaje}</p>
          {estado === "cargando" && (
            <div className="d-flex justify-content-center mt-3">
              <Spinner animation="border" variant="primary" />
            </div>
          )}
          {estado !== "cargando" && (
            <button className="btn btn-primary mt-4" onClick={() => navigate("/")}>
              Ir a la página principal
            </button>
          )}
        </div>
      </div>
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
