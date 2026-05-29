import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const publicKey = body.publicKey || process.env.PAGOPAR_PUBLIC_KEY;
    const privateKey = body.privateKey || process.env.PAGOPAR_PRIVATE_KEY;
    const hashPedido = body.hashPedido;
    
    if (!publicKey || !privateKey || !hashPedido) {
      return NextResponse.json({ error: "Faltan tokens o hash_pedido" }, { status: 400 });
    }

    // Token para consulta: sha1(private_key + "CONSULTA")
    const token = crypto.createHash('sha1').update(privateKey + "CONSULTA").digest('hex');

    const payload = {
      hash_pedido: hashPedido,
      token: token,
      token_publico: publicKey
    };

    const res = await fetch("https://api.pagopar.com/api/pedidos/1.1/traer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
