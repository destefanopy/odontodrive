import { NextResponse } from 'next/server';
import { supabase } from '@/infrastructure/supabase';
import DodoPayments from 'dodopayments';

// Inicializar el SDK de Dodo. Se debe agregar DODO_API_KEY al .env
const dodoClient = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY || "sk_test_dodo_placeholder", 
  environment: process.env.NODE_ENV === 'production' ? 'live_mode' : 'test_mode'
});

export async function POST(req: Request) {
  try {
    const { planId } = await req.json();

    if (!planId) {
      return NextResponse.json({ error: "Faltan datos del plan" }, { status: 400 });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Falta token de autenticación" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    // Obtener usuario autenticado real desde Supabase enviando el token
    const { data: authData, error: authErr } = await supabase.auth.getUser(token);
    
    if (authErr || !authData.user) {
      console.error("Error Auth Checkout:", authErr);
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 });
    }
    const user = authData.user;

    // Mapeo de IDs de planes a Product IDs reales de Dodo Payments.
    // El doctor debe crear los 4 productos en su dashboard de Dodo y pegar aquí los IDs (empiezan con prdt_...)
    const dodoProductIds: Record<string, string> = {
      basico: process.env.DODO_PRDT_BASICO || "prdt_basico_placeholder",
      estandar: process.env.DODO_PRDT_ESTANDAR || "prdt_estandar_placeholder",
      avanzado: process.env.DODO_PRDT_AVANZADO || "prdt_avanzado_placeholder",
      premium: process.env.DODO_PRDT_PREMIUM || "prdt_premium_placeholder"
    };

    const productId = dodoProductIds[planId];
    if (!productId) {
      return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
    }

    // Crear Link de Pago en Dodo
    const payment = await dodoClient.payments.create({
      billing: {
        city: "",
        country: "US",     
        state: "",
        street: "",
        zipcode: ""
      },
      customer: {
        email: user.email || "odontologo@ejemplo.com",
        name: user.user_metadata?.full_name || "Doctor " + user.id.substring(0,5)
      },
      product_cart: [
        {
          product_id: productId,
          quantity: 1
        }
      ],
      // Importante: Pasamos el user.id como payload escondido en la URL de retorno o en metadata para el webhook
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://' + (process.env.VERCEL_URL || 'localhost:3000')}/suscripcion?success=true`,
      tax_id: ""
    });

    return NextResponse.json({ url: payment.payment_link });

  } catch (error: any) {
    console.error("Error creando Checkout Dodo:", error);
    return NextResponse.json({ error: error.message || "Error procesando pago" }, { status: 500 });
  }
}
