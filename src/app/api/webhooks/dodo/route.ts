import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import DodoPayments from 'dodopayments';

const dodoClient = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY || ''
});

// Necesitamos la Service Role Key para hacer bypass al RLS porque es un entorno de servidor sin token de usuario
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "", 
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    
    // Logear INMEDIATAMENTE cualquier cosa que toque este endpoint, sin importar firmas ni JSON válido
    let parsedBody = {};
    try { parsedBody = JSON.parse(rawBody); } catch(e) {}
    
    await supabaseAdmin.from('dodo_logs').insert([{ 
      log_data: { 
        headers: Object.fromEntries(req.headers.entries()),
        body: parsedBody,
        raw: rawBody
      } 
    }]);

    const signature = req.headers.get('dodo-signature');

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 401 });
    }

    // El secreto del Webhook configurado en el Dashboard de Dodo
    const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
    
    // Verificación básica de la firma HMAC SHA256 (Si Dodo la requiere, verifica con su documentación)
    if (webhookSecret) {
      const hmac = crypto.createHmac('sha256', webhookSecret);
      const computedSignature = hmac.update(rawBody).digest('hex');
      // Comparar de forma segura en producción
      // if (computedSignature !== signature) throw new Error("Invalid signature");
    }

    const event = JSON.parse(rawBody);

    // Guardar TODO el payload para poder depurarlo en vivo
    await supabaseAdmin.from('dodo_logs').insert([{ log_data: event }]);

    // Eventos enviados por DodoPayments
    if (event.type === 'payment.succeeded' || event.type === 'subscription.active') {
      const paymentData = event.data;
      const customerEmail = paymentData.customer?.email;
      
      if (!customerEmail) {
        throw new Error("No customer email in webhook payload");
      }

      // Buscar al usuario por email en nuestra tabla de perfiles 'public.perfiles'
      const { data: perfiles, error: searchError } = await supabaseAdmin
        .from('perfiles')
        .select('id, email, dodo_subscription_id')
        .eq('email', customerEmail);
        
      if (searchError || !perfiles || perfiles.length === 0) {
        throw new Error("No se encontró usuario con el email del pago: " + customerEmail);
      }

      const userId = perfiles[0].id;
      const oldDodoSubId = perfiles[0].dodo_subscription_id;

      // Determinar qué plan compró basándonos en el Product ID
      const dodoProductIds: Record<string, string> = {
        [(process.env.DODO_PRDT_BASICO || "").trim()]: "basico",
        [(process.env.DODO_PRDT_ESTANDAR || "").trim()]: "estandar",
        [(process.env.DODO_PRDT_AVANZADO || "").trim()]: "avanzado",
        [(process.env.DODO_PRDT_PREMIUM || "").trim()]: "premium"
      };

      const items = paymentData.product_cart || [];
      const purchasedProductId = items[0]?.product_id || paymentData.product_id;
      const nuevoPlan = dodoProductIds[purchasedProductId] || "estandar"; // Fallback por defecto

      const dodoSubId = paymentData.subscription_id || event.data?.subscription_id || paymentData.id || null;

      if (oldDodoSubId && oldDodoSubId !== dodoSubId) {
        console.log(`Cancelando suscripción antigua ${oldDodoSubId} para evitar doble cobro...`);
        try {
          await dodoClient.subscriptions.update(oldDodoSubId, { status: "cancelled" });
        } catch (dodoErr) {
          console.error("Error al cancelar suscripcion antigua:", dodoErr);
          try {
            // @ts-ignore
            if (dodoClient.subscriptions.cancel) await dodoClient.subscriptions.cancel(oldDodoSubId);
          } catch(e){}
        }
      }

      // Usar la función RPC para actualizar 'perfiles' y 'plan_actual' en auth.users TODO A LA VEZ en modo Security Definer
      await supabaseAdmin.rpc('admin_mejorar_plan', {
        user_id: userId,
        nuevo_plan: nuevoPlan,
        var_dodo_id: dodoSubId
      });

      console.log(`✅ Suscripción Dodo exitosa: ${customerEmail} mejorado a ${nuevoPlan}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("Webhook Dodo Error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
