import { useEffect, useRef, useState } from "react";

export default function QrWithCenterImage({
  qrSrc,          // data URL of QR from backend (asset.qrCode)
  logoSrc,        // asset image URL from Cloudinary (asset.image)
  size = 200,     // final size of QR in px
  logoRatio = 0.22, // logo size relative to QR size
  className,
  onReady,        // optional callback(mergedDataUrl)
}) {
  const canvasRef = useRef(null);
  const [mergedSrc, setMergedSrc] = useState(qrSrc);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = size;
    canvas.height = size;

    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    qrImg.src = qrSrc;

    qrImg.onload = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(qrImg, 0, 0, size, size);

      if (!logoSrc || logoSrc === "N/A") {
        const out = canvas.toDataURL("image/png");
        setMergedSrc(out);
        onReady?.(out);
        return;
      }

      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.src = logoSrc;

      logoImg.onload = () => {
        const logoSize = Math.round(size * logoRatio);
        const x = (size - logoSize) / 2;
        const y = (size - logoSize) / 2;

        // White background under logo to keep QR scannable
        const pad = Math.round(logoSize * 0.12);
        ctx.fillStyle = "#fff";
        ctx.fillRect(x - pad / 2, y - pad / 2, logoSize + pad, logoSize + pad);

        ctx.drawImage(logoImg, x, y, logoSize, logoSize);

        const out = canvas.toDataURL("image/png");
        setMergedSrc(out);
        onReady?.(out);
      };
    };
  }, [qrSrc, logoSrc, size, logoRatio, onReady]);

  return (
    <>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <img src={mergedSrc} alt="QR with logo" className={className} />
    </>
  );
}
