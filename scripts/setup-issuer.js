import { Keypair } from '@stellar/stellar-sdk';

async function run() {
    const pair = Keypair.random();
    console.log(`\n--- Generating a new keypair ---`);
    console.log(`Public Key: ${pair.publicKey()}`);
    console.log(`Secret Key: ${pair.secret()}`);

    console.log(`\nFunding account via Friendbot...`);
    try {
        const response = await fetch(`https://friendbot.stellar.org/?addr=${pair.publicKey()}`);
        if (response.ok) {
            console.log("✅ Account successfully funded on Testnet.");
            console.log("\n👇 Add these to your .env file 👇");
            console.log(`VITE_SAAS_ISSUER_PUBLIC_KEY="${pair.publicKey()}"`);
            console.log(`VITE_SAAS_ISSUER_SECRET_KEY="${pair.secret()}"\n`);
        } else {
            console.error("❌ Failed to fund account.", await response.text());
        }
    } catch (e) {
        console.error("❌ Error funding account:", e);
    }
}

run();
