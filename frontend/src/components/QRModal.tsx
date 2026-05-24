import React from 'react';
import { X, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface QRModalProps {
  boletaId: number;
  codigoQr: string;
  onClose: () => void;
}

const QRModal: React.FC<QRModalProps> = ({ boletaId, codigoQr, onClose }) => {
  
  const handleDownload = () => {
    const svg = document.getElementById("qr-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if(ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `boleta_${boletaId}_qr.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="modal-overlay animate-fade" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal animate-slide-up" onClick={e => e.stopPropagation()} style={{ zIndex: 10000 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Código QR de Control</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', display: 'inline-block', marginBottom: '1.5rem' }}>
            <QRCodeSVG 
              id="qr-svg"
              value={codigoQr || `boleta-${boletaId}`} 
              size={220} 
              level="H" 
              includeMargin={true}
            />
          </div>
          
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            ID de Boleta: <span style={{ color: 'white', fontWeight: 700 }}>#{boletaId}</span>
            <br />
            Utilice este código para el escaneo en puntos de control.
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={handleDownload} style={{ flex: 1 }}>
              <Download size={18} /> Descargar
            </button>
            <button className="btn btn-primary" onClick={onClose} style={{ flex: 1 }}>
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRModal;