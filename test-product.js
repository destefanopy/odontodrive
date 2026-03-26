const DodoPayments = require('dodopayments').default || require('dodopayments');

async function checkProduct() {
  const apiKey = "lxM2qhRvW8J9zwKr.as4f8ItnNB4YCOG7YX7tWOieu8RTMDYOBh_Yonv8p6d9ChrG";
  const client = new DodoPayments({ bearerToken: apiKey, environment: 'live_mode' });
  
  try {
    console.log("Buscando pdt_0NbHoyhnkHOz6UVtmFJvn directamente...");
    const product = await client.products.retrieve("pdt_0NbHoyhnkHOz6UVtmFJvn");
    console.log("SUCCESS");
    console.log(JSON.stringify(product, null, 2));
  } catch(e) {
    console.log("FAIL RECUPERANDO pdt_0NbHoyhnkHOz6UVtmFJvn:");
    if (e.response && e.response.data) {
        console.log(JSON.stringify(e.response.data, null, 2));
    } else {
        console.log(e.message || e);
    }
  }

  try {
    console.log("\nBuscando pdt_0NbHpWVo4zNyYVIAPWbKO (Premium)...");
    const productPremium = await client.products.retrieve("pdt_0NbHpWVo4zNyYVIAPWbKO");
    console.log("SUCCESS PREMIUM");
    console.log(productPremium.name);
  } catch(e) {
    console.log("FAIL PREMIUM:", e.message || e);
  }
}

checkProduct();
