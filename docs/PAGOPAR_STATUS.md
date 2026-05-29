# Estado de Integración: Pagopar

## Lo que ya logramos (Staging/Pruebas)
1. **Flujo Estándar:** Completamos el circuito de validación en la consola de Pagopar (Paso 1, 2 y 3).
2. **Webhooks:** El endpoint `/api/pagopar/estandar/webhook` está recibiendo y respondiendo los pagos correctamente.
3. **Sandbox:** Creada la página `pagopar-test/page.tsx` para hacer pruebas desde el frontend (con guardado de tokens en localStorage).

## Lo que está pendiente (Bloqueado por Pagopar)
Estamos a la espera de que el equipo de soporte de Pagopar responda el correo electrónico para:
- Otorgar los **Tokens de Producción**.
- Habilitar el módulo de **Catastro de Tarjetas y Pagos Recurrentes** (para poder usar el CRON automático).
- Quitar la validación estricta de IPs (Excepción para Vercel Serverless).

## Siguientes pasos en el desarrollo (Cuando el usuario lo decida)
1. Construir la UI del paciente para ver deudas.
2. Construir la UI del paciente para gestionar sus tarjetas (depende de que habiliten el Catastro).
3. Configurar el CRON para debitar automáticamente usando los tokens de las tarjetas.
