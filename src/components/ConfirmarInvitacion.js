// src/components/ConfirmarInvitacion.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API } from "../services/ApiService";

export default function ConfirmarInvitacion() {
  const { token, accion } = useParams();
  const [estado, setEstado] = useState("procesando");

  useEffect(() => {
    // Solo ejecuta si hay token y acción válida
    if (token && (accion === "aceptar" || accion === "rechazar")) {
      API.post(`api/confirmar_invitacion/${token}/`, { aceptar: accion === "aceptar" })
        .then(() => setEstado("ok"))
        .catch(() => setEstado("error"));
    } else {
      setEstado("error");
    }
  }, [token, accion]);

  if (estado === "procesando") return <div>Procesando invitación...</div>;
  if (estado === "ok") return <div>¡Invitación {accion === "aceptar" ? "aceptada" : "rechazada"} correctamente!</div>;
  return <div>Hubo un error al procesar la invitación.</div>;
}
