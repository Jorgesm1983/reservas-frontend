import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API } from '../services/ApiService';
import Header from '../components/Header';
import { ToastContainer, toast } from 'react-toastify';
import { Spinner } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';
import { AddToCalendarButton } from 'add-to-calendar-button-react';

export default function AceptarInvitacionPage() {
  const { token } = useParams();
  const [estado, setEstado] = useState('cargando');
  const [mensaje, setMensaje] = useState("Procesando invitación...");
  const navigate = useNavigate();
  const [invitacion, setInvitacion] = useState(null);

  useEffect(() => {
    toast.dismiss('inv-aceptada');
    API.get(`api/invitaciones/${token}/aceptar/`)
      .then(res => {
        const msg = res.data.detail;
        setMensaje(msg);
        setInvitacion(res.data.invitacion);
        if (msg === "Invitación aceptada correctamente.") {
          setEstado('aceptada');
        } else if (msg === "La invitación ya fue aceptada.") {
          setEstado('ya-aceptada');
        } else {
          setEstado('error');
        }
      })
      .catch(() => {
        const errMsg = 'No se pudo aceptar la invitación. Puede que ya haya sido aceptada o que el enlace no sea válido.';
        setMensaje(errMsg);
        setEstado('error');
      });
  }, [token]);

  // Icono y título según estado
  let icono, titulo, texto;
  if (estado === "aceptada") {
    icono = <i className="bi bi-check-circle-fill text-success" style={{ fontSize: 32, verticalAlign: "middle" }}></i>;
    titulo = "Invitación aceptada";
    texto = "Puedes añadir el evento a tu calendario.";
  } else if (estado === "ya-aceptada") {
    icono = <i className="bi bi-info-circle-fill text-info" style={{ fontSize: 32, verticalAlign: "middle" }}></i>;
    titulo = "Invitación ya aceptada";
    texto = "Ya puedes añadir el evento a tu calendario.";
  } else if (estado === "error") {
    icono = <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: 32, verticalAlign: "middle" }}></i>;
    titulo = "Error al aceptar invitación";
    texto = mensaje;
  } else {
    icono = <i className="bi bi-info-circle-fill text-info" style={{ fontSize: 32, verticalAlign: "middle" }}></i>;
    titulo = "Procesando invitación";
    texto = mensaje;
  }

  // Prepara los datos para el botón
  let calendarProps = null;
  if (invitacion && invitacion.reserva) {
    const court = invitacion.reserva.court;
    const timeslot = invitacion.reserva.timeslot;
    calendarProps = {
      name: `Partido en ${court?.name || "Pista"}`,
      description: `Reserva confirmada en ${court?.comunidad_nombre || ""}, ${court?.comunidad_direccion || ""}`,
      startDate: invitacion.reserva.date,
      endDate: invitacion.reserva.date,
      startTime: timeslot?.start_time?.slice(0,5) || "00:00",
      endTime: timeslot?.end_time?.slice(0,5) || "00:00",
      location: `${court?.comunidad_nombre || ""}, ${court?.comunidad_direccion || ""}`,
      options: ['Apple','Google','iCal','Outlook.com','Microsoft365','Yahoo'],
      timeZone: "Europe/Madrid",
      label: "Añadir al calendario",
      lightMode: "bodyScheme"
    };
  }

  return (
    <div style={{ background: "#f6f8fa",}}>
      <Header showHomeIcon={true} showLogout={false} />
      <div className="container d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
        <div
          className="shadow-lg text-center"
          style={{
            maxWidth: 340,
            background: "#e3f7fc",
            borderRadius: 12,
            padding: "2rem 1.5rem",
            marginTop: 32
          }}
        >
          <h4 className="mb-2" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            {icono}
            <span className="ms-2">{titulo}</span>
          </h4>
          <p className="mb-3">{texto}</p>

          {(estado === "aceptada" || estado === "ya-aceptada") && calendarProps && (
            <div className="mt-4 d-flex justify-content-center">
              <AddToCalendarButton {...calendarProps} />
            </div>
          )}

          {/* Elimina el botón de "Ir a la página principal" si tienes el icono Home en el header */}
          {/* Si lo quieres dejar, descomenta la siguiente línea */}
          {/* <button className="btn btn-primary w-100" onClick={() => navigate("/")}>Ir a la página principal</button> */}

          {estado === "cargando" && (
            <div className="d-flex justify-content-center mt-3">
              <Spinner animation="border" variant="primary" />
            </div>
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
