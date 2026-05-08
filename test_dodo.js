const DodoPayments = require('dodopayments').default || require('dodopayments');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  const cleanKey = key ? key.replace(/\s/g, '') : '';
  if (cleanKey && val.length) {
    envVars[cleanKey] = val.join('=').trim().replace(/^"|"$/g, '').replace(/\s/g, '');
  }
});

const dodoClient = new DodoPayments({
  bearerToken: envVars['DODO_API_KEY'] || 'test',
  environment: 'test_mode'
});

async function run() {
  try {
    // try to get subscriptions
    const sub = await dodoClient.subscriptions.update('sub_0NeMaORHm1h8zLjOYYGqU', { status: 'cancelled' });
    console.log("Success:", sub);
  } catch (e) {
    console.log("Error status:", e.status);
    console.log("Error data:", e.error);
  }
}
run();
