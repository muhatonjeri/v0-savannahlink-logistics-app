// QR code generator for eTIMS receipt verification
// Uses canvas API — works in browser only

export async function generateQRDataURL(text: string, size = 128): Promise<string> {
  try {
    // Dynamic import to avoid SSR issues
    const QRCode = await import("qrcode");
    return await QRCode.default.toDataURL(text, {
      width: size,
      margin: 1,
      color: { dark: "#0a1628", light: "#ffffff" },
      errorCorrectionLevel: "M",
    });
  } catch {
    // Fallback: return a placeholder
    return "";
  }
}

export function generateEtimsVerifyUrl(receiptNo: string): string {
  return `https://etims.kra.go.ke/verify/${receiptNo}`;
}
