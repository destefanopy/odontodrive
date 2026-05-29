import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Imprimimos en la consola de Vercel para debug
    console.log("====== WEBHOOK PAGOPAR RECIBIDO ======");
    console.log(JSON.stringify(body, null, 2));

    // Pagopar exige que el servidor devuelva un HTTP 200 y el contenido del array "resultado" que ellos enviaron.
    if (body && body.resultado) {
      return NextResponse.json(body.resultado);
    }

    return NextResponse.json({ error: "Estructura no válida" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
