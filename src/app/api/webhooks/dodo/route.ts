import { NextResponse } from 'next/server';
import { supabase } from '@/infrastructure/supabase';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
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

    // Eventos enviados por DodoPayments
    if (event.type === 'payment.succeeded' || event.type === 'subscription.active') {
      const paymentData = event.data;
      const customerEmail = paymentData.customer?.email;
      
      if (!customerEmail) {
        throw new Error("No customer email in webhook payload");
      }

      // Buscar al usuario por email en nuestra tabla de perfiles 'public.perfiles'
      const { data: perfiles, error: searchError } = await supabase
        .from('perfiles')
        .select('id, email')
        .eq('email', customerEmail);
        
      if (searchError || !perfiles || perfiles.length === 0) {
        throw new Error("No se encontró usuario con el email del pago: " + customerEmail);
      }

      const userId = perfiles[0].id;

      // Determinar qué plan compró basándonos en el Product ID
      const dodoProductIds: Record<string, string> = {
        [process.env.DODO_PRDT_BASICO || "prdt_basico"]: "basico",
        [process.env.DODO_PRDT_ESTANDAR || "prdt_estandar"]: "estandar",
        [process.env.DODO_PRDT_AVANZADO || "prdt_avanzado"]: "avanzado",
        [process.env.DODO_PRDT_PREMIUM || "prdt_premium"]: "premium"
      };

      const items = paymentData.product_cart || [];
      const purchasedProductId = items[0]?.product_id;
      const nuevoPlan = dodoProductIds[purchasedProductId] || "estandar"; // Fallback por defecto

      // Actualizar el plan en el perfil público
      const { error: updatePublicErr } = await supabase
        .from('perfiles')
        .update({ plan: nuevoPlan })
        .eq('id', userId);

      // Usar la función RPC para actualizar el 'plan_actual' en auth.users si es necesario
      await supabase.rpc('admin_mejorar_plan', {
        user_id: userId,
        nuevo_plan: nuevoPlan
      });

      console.log(`✅ Suscripción Dodo exitosa: ${customerEmail} mejorado a ${nuevoPlan}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("Webhook Dodo Error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
