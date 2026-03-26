import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import DodoPayments from 'dodopayments';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "", 
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const dodoClient = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY || ''
});

export async function POST(req: Request) {
  try {
    const { subscription_id } = await req.json();

    if (!subscription_id) {
      return NextResponse.json({ error: "Falta subscription_id" }, { status: 400 });
    }

    // Identificar usuario desde el Token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado. Token faltante." }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    
    const { data: authData, error: authError } = await supabaseAnon.auth.getUser(token);
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
    const userId = authData.user.id;

    // Log tracking inicio
    await supabaseAdmin.from('dodo_logs').insert([{ log_data: { step: "verify_start", user: userId, sub: subscription_id } }]);

    // 1. Verificar la suscripción directamente contra Dodo Payments API
    const dodoData: any = await dodoClient.subscriptions.retrieve(subscription_id);

    // Log tracking dodo response
    await supabaseAdmin.from('dodo_logs').insert([{ log_data: { step: "verify_dodo_ok", payload: dodoData } }]);

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
    const nuevoPlan = dodoProductIds[purchasedProductId] || "estandar";

    // 2. Delegar TODA la actualización a la función con privilegios máximos (SECURITY DEFINER) de Postgres
    const { error: rpcError } = await supabaseAdmin.rpc('admin_mejorar_plan', {
      user_id: userId,
      nuevo_plan: nuevoPlan,
      var_dodo_id: subscription_id
    });

    if (rpcError) {
      await supabaseAdmin.from('dodo_logs').insert([{ log_data: { step: "verify_rpc_error", rpcError } }]);
      throw new Error("No se pudo aplicar la mejora de cuenta en la base de datos.");
    }

    await supabaseAdmin.from('dodo_logs').insert([{ log_data: { step: "verify_success", nuevoPlan } }]);

    return NextResponse.json({ success: true, plan: nuevoPlan });

  } catch (error: any) {
    console.error("Error validando checkout:", error);
    await supabaseAdmin.from('dodo_logs').insert([{ log_data: { step: "verify_catch_error", msg: error.message, stack: error.stack } }]);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
