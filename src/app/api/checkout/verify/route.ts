import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import DodoPayments from 'dodopayments';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "", 
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const dodoClient = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY || ''
});

export async function POST(req: Request) {
  try {
    const { subscription_id, email } = await req.json();

    if (!subscription_id || !email) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
    }

    // 1. Verificar la suscripción directamente contra Dodo Payments API
    // Usaremos any hasta que conozcamos bien los tipos del retrieve()
    const dodoData: any = await dodoClient.subscriptions.retrieve(subscription_id);

    if (dodoData.status !== 'active' && dodoData.status !== 'trialing') {
       return NextResponse.json({ error: `La suscripción aún no está activa (estado: ${dodoData.status}).` }, { status: 400 });
    }

    // Identificar el producto 
    const dodoProductIds: Record<string, string> = {
      [(process.env.DODO_PRDT_BASICO || "").trim()]: "basico",
      [(process.env.DODO_PRDT_ESTANDAR || "").trim()]: "estandar",
      [(process.env.DODO_PRDT_AVANZADO || "").trim()]: "avanzado",
      [(process.env.DODO_PRDT_PREMIUM || "").trim()]: "premium"
    };

    const purchasedProductId = dodoData.product_id || (dodoData.items && dodoData.items[0]?.product_id) || (dodoData.product_cart && dodoData.product_cart[0]?.product_id);
    const nuevoPlan = dodoProductIds[purchasedProductId] || "estandar"; // Fallback por defecto

    // 2. Buscar al usuario por email
    const { data: perfiles, error: searchError } = await supabaseAdmin
      .from('perfiles')
      .select('id, email, plan')
      .eq('email', email);

    if (searchError || !perfiles || perfiles.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const userId = perfiles[0].id;

    // 3. Actualizar la base de datos
    await supabaseAdmin
      .from('perfiles')
      .update({ 
        plan: nuevoPlan,
        dodo_subscription_id: subscription_id
      })
      .eq('id', userId);

    await supabaseAdmin.rpc('admin_mejorar_plan', {
      user_id: userId,
      nuevo_plan: nuevoPlan
    });

    return NextResponse.json({ success: true, plan: nuevoPlan });

  } catch (error: any) {
    console.error("Error validando checkout:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
