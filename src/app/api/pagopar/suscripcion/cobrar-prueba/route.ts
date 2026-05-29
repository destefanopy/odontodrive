import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST() {
  try {
    const publicKey = process.env.PAGOPAR_PUBLIC_KEY;
    const privateKey = process.env.PAGOPAR_PRIVATE_KEY;
    
    if (!publicKey || !privateKey) {
      return NextResponse.json({ error: "Faltan tokens de Pagopar en .env.local" }, { status: 400 });
    }

    const tokenBase = crypto.createHash('sha1').update(privateKey + "PAGO-RECURRENTE").digest('hex');
    const logs: any[] = [];

    // PASO 1: Iniciar Transacción para generar un 'hash_pedido'
    const idPedidoTemporal = Date.now().toString();
    const monto = 10000;
    const tokenInit = crypto.createHash('sha1').update(`${privateKey}${idPedidoTemporal}${monto}`).digest('hex');
    
    const payloadInit = {
      token: tokenInit,
      public_key: publicKey,
      monto_total: monto,
      tipo_pedido: "VENTA-COMERCIO",
      comprador: {
        ruc: "",
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
          nombre: "Prueba de Suscripción CRON",
          cantidad: 1,
          categoria: "909",
          public_key: publicKey,
          url_imagen: "",
          descripcion: "Prueba de débito automático",
          id_producto: 1,
          precio_total: monto,
          vendedor_telefono: "",
          vendedor_direccion: "",
          vendedor_direccion_referencia: "",
          vendedor_direccion_coordenadas: ""
        }
      ],
      fecha_maxima_pago: new Date(Date.now() + 86400000).toISOString().replace("T", " ").substring(0, 19), // Mañana
      id_pedido_comercio: idPedidoTemporal,
      descripcion_resumen: "Suscripcion Prueba",
      forma_pago: 1 // Efectivo/Varios
    };

    logs.push("Llamando a iniciar-transaccion...");
    const resInit = await fetch("https://api.pagopar.com/api/comercios/2.0/iniciar-transaccion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadInit)
    });
    
    const dataInit = await resInit.json();
    logs.push({ step: "iniciar-transaccion", data: dataInit });

    if (!dataInit.respuesta) {
       return NextResponse.json({ error: "Fallo iniciar-transaccion", logs, details: dataInit });
    }

    const hashPedido = dataInit.resultado[0].data;

    // PASO 2: Listar Tarjetas del usuario
    logs.push("Llamando a listar-tarjeta...");
    const payloadListar = {
      token: tokenBase,
      token_publico: publicKey,
      identificador: 9999 // Admin ID
    };

    const resListar = await fetch("https://api.pagopar.com/api/pago-recurrente/3.0/listar-tarjeta/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadListar)
    });

    const dataListar = await resListar.json();
    logs.push({ step: "listar-tarjeta", data: dataListar });

    if (!dataListar.respuesta || !dataListar.resultado || dataListar.resultado.length === 0) {
      return NextResponse.json({ error: "No hay tarjetas guardadas para cobrar.", logs });
    }

    const aliasToken = dataListar.resultado[0].alias_token; // Tomamos la primera tarjeta

    // PASO 3: Cobrar (Pagar)
    logs.push("Llamando a pagar...");
    const payloadPagar = {
      token: tokenBase,
      token_publico: publicKey,
      hash_pedido: hashPedido,
      tarjeta: aliasToken,
      identificador: 9999
    };

    const resPagar = await fetch("https://api.pagopar.com/api/pago-recurrente/3.0/pagar/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadPagar)
    });

    const dataPagar = await resPagar.json();
    logs.push({ step: "pagar", data: dataPagar });

    return NextResponse.json({ success: true, logs });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
