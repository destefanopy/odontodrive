import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const publicKey = body.publicKey || process.env.PAGOPAR_PUBLIC_KEY;
    const privateKey = body.privateKey || process.env.PAGOPAR_PRIVATE_KEY;
    
    if (!publicKey || !privateKey) {
      return NextResponse.json({ respuesta: false, resultado: "Faltan tokens de Pagopar en .env.local" }, { status: 400 });
    }

    const token = crypto.createHash('sha1').update(privateKey + "PAGO-RECURRENTE").digest('hex');

    // Usamos el ID = 9999 para el admin en esta prueba
    const payload = {
      token: token,
      token_publico: publicKey,
      identificador: 9999, 
      nombre_apellido: "Admin Destefano",
      email: "destefanopy@gmail.com",
      celular: "0981000000"
    };

    const response = await fetch("https://api.pagopar.com/api/pago-recurrente/3.0/agregar-cliente/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ respuesta: false, resultado: error.message }, { status: 500 });
  }
}
