import React from 'react';

export default function Footer({ fondoAzul }) {
  return (
    <footer
      className={`text-center py-3 mt-auto ${fondoAzul ? 'footer-login-azul' : 'footer-login-gris'}`}
      style={{ fontSize: '0.95rem' }}
    >
      &copy; {new Date().getFullYear()} PistaReserva. Todos los derechos reservados.
    </footer>
  );
}
