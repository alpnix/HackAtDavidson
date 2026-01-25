import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface FormQRCodeProps {
  submitUrl: string;
  formTitle: string;
  className?: string;
}

export function FormQRCode({ submitUrl, formTitle, className }: FormQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const png = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = png;
    a.download = `qr-${formTitle.replace(/[^a-z0-9]/gi, "-").toLowerCase() || "form"}.png`;
    a.click();
  };

  return (
    <div className={className}>
      <div className="inline-flex flex-col items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
        <QRCodeCanvas
          ref={canvasRef}
          value={submitUrl}
          size={192}
          level="M"
          includeMargin
        />
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download QR code
        </Button>
      </div>
    </div>
  );
}
