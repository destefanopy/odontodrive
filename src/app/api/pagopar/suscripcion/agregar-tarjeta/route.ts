import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const publicKey = process.env.PAGOPAR_PUBLIC_KEY;
    const privateKey = process.env.PAGOPAR_PRIVATE_KEY;
    // URL de tu entorno local / produccion
    const host = req.headers.get("host");
    const protocol = host?.includes("localhost") ? "http" : "https";
    
    if (!publicKey || !privateKey) {
      return NextResponse.json({ respuesta: false, resultado: "Faltan tokens de Pagopar en .env.local" }, { status: 400 });
    }

    const token = crypto.createHash('sha1').update(privateKey + "PAGO-RECURRENTE").digest('hex');

    const payload = {
      token: token,
      token_publico: publicKey,
      url: `${protocol}://${host}/pagopar-test`,
      proveedor: "uPay", // Recomendado en la documentación para VISA y Mastercard
      identificador: 9999 // Mismo ID del admin
    };

    const response = await fetch("https://api.pagopar.com/api/pago-recurrente/3.0/agregar-tarjeta/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // Si fue exitoso, anexamos la URL del iframe para el frontend
    if (data.respuesta && data.resultado) {
      data.iframeUrl = `https://www.pagopar.com/upay-iframe/?id-form=${data.resultado}`;
    }

    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ respuesta: false, resultado: error.message }, { status: 500 });
  }
}
