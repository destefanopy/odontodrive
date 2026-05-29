import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const publicKey = body.publicKey || process.env.PAGOPAR_PUBLIC_KEY;
    const privateKey = body.privateKey || process.env.PAGOPAR_PRIVATE_KEY;
    
    if (!publicKey || !privateKey) {
      return NextResponse.json({ respuesta: false, resultado: "Faltan tokens de Pagopar" }, { status: 400 });
    }

    const idPedidoTemporal = Date.now().toString();
    const monto = 10000;
    const tokenInit = crypto.createHash('sha1').update(`${privateKey}${idPedidoTemporal}${monto}`).digest('hex');
    
    const payload = {
      token: tokenInit,
      public_key: publicKey,
      monto_total: monto,
      tipo_pedido: "VENTA-COMERCIO",
      comprador: {
        ruc: "1234567-8",
        email: "destefanopy@gmail.com",
        ciudad: 1,
        nombre: "Admin Destefano",
        telefono: "0981000000",
        direccion: "",
        documento: "1234567",
        coordenadas: "",
        razon_social: "Admin Destefano",
        tipo_documento: "CI",
        direccion_referencia: ""
      },
      compras_items: [
        {
          ciudad: 1,
          nombre: "Consulta Odontológica",
          cantidad: 1,
          categoria: "909",
          public_key: publicKey,
          url_imagen: "",
          descripcion: "Prueba de Pase a Producción",
          id_producto: 1,
          precio_total: monto,
          vendedor_telefono: "",
          vendedor_direccion: "",
          vendedor_direccion_referencia: "",
          vendedor_direccion_coordenadas: ""
        }
      ],
      fecha_maxima_pago: new Date(Date.now() + 86400000).toISOString().replace("T", " ").substring(0, 19),
      id_pedido_comercio: idPedidoTemporal,
      descripcion_resumen: "Suscripcion Prueba",
      forma_pago: 1 // Efectivo/Varios
    };

    const res = await fetch("https://api.pagopar.com/api/comercios/2.0/iniciar-transaccion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ respuesta: false, resultado: error.message }, { status: 500 });
  }
}
