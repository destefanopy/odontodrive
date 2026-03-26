const DodoPayments = require('dodopayments').default || require('dodopayments');

async function testCart() {
  const apiKey = "lxM2qhRvW8J9zwKr.as4f8ItnNB4YCOG7YX7tWOieu8RTMDYOBh_Yonv8p6d9ChrG";
  const client = new DodoPayments({ bearerToken: apiKey, environment: 'live_mode' });
  const productId = "pdt_0NbHoyhnkHOz6UVtmFJvn"; // Básico
  
  try {
    console.log("Probando con checkoutSessions.create()...");
    const session = await client.checkoutSessions.create({
      billing: { city: "", country: "US", state: "", street: "", zipcode: "" },
      customer: { email: "test@example.com", name: "Doctor Test" },
      product_cart: [{ product_id: productId, quantity: 1 }],
      return_url: "http://localhost:3000/suscripcion?success=true",
    });
    console.log("SUCCESS checkoutSessions.create:", session);
  } catch(e) {
    console.log("FAIL checkoutSessions.create:", e.response ? e.response.data : (e.message || e));
  }
}

testCart();
