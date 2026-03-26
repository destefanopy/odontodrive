const { DodoPayments } = require('dodo-payments');

const dodoClient = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY || 'test' // Reemplazar despues en cmd si hace falta
});

console.log("Customers methods:", Object.keys(dodoClient.customers));
console.log("Subscriptions methods:", Object.keys(dodoClient.subscriptions));
