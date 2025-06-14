
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el estado para mostrar el UI alternativo
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Puedes loguear el error o enviarlo a un servicio externo aquí
    console.error("Error capturado por ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // UI alternativo (puedes personalizarlo)
      return <div style={{textAlign: "center", marginTop: 80}}><h2>Algo salió mal. Redirigiendo...</h2></div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;