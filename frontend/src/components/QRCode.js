import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const QRCodeGenerator = ({ url, size = 200, includeMargin = true }) => {
  const canvasRef = useRef();

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        url,
        {
          width: size,
          margin: includeMargin ? 4 : 0,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        }
      );
    }
  }, [url, size, includeMargin]);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} className="rounded-lg shadow-lg" />
      <div className="text-sm text-gray-500">
        Scan to view profile
      </div>
    </div>
  );
};

export default QRCodeGenerator;