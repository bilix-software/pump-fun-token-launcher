import { launchToken, TokenLaunchConfig, validateTokenConfig } from './src';
import { Keypair } from '@solana/web3.js';

// Example configuration
const tokenConfig: TokenLaunchConfig = {
  name: "Example Token",
  symbol: "EXAMPLE",
  metadataUrl: "https://example.com/token-image.png",
  mintKeypair: undefined, // Optional: use a custom mint keypair if needed, otherwise it will be generated automatically
  initialBuy: 0.1, // 0.1 SOL initial buy
  slippage: 5,     // 5% slippage tolerance
  priorityFee: 0.001 // 0.001 SOL priority fee
};

async function main() {
  try {
    // Validate configuration first
    console.log("Validating token configuration...");
    validateTokenConfig(tokenConfig);
    console.log("✅ Configuration is valid");

    // Replace with your actual private key (base64 encoded)
    // Or use environment variable: process.env.PRIVATE_KEY
    const privateKey = "YOUR_BASE64_ENCODED_PRIVATE_KEY_HERE";
    
    // Alternative: Generate a new keypair for testing
    // const keyPair = Keypair.generate();
    // console.log("Generated new keypair:", keyPair.publicKey.toString());

    console.log("Launching token...");
    console.log("Config:", tokenConfig);

    // Launch the token
    const result = await launchToken(
      tokenConfig,
      privateKey,
      // Optional: specify custom RPC URL
      // "https://your-custom-rpc-url.com"
    );

    if (result.success) {
      console.log("🎉 Token launched successfully!");
      console.log("Token Address:", result.tokenAddress);
      console.log("Transaction Signature:", result.signature);
      console.log("View on Solscan:", `https://solscan.io/tx/${result.signature}`);
    } else {
      console.error("❌ Token launch failed:");
      console.error(result.error);
    }

  } catch (error) {
    console.error("❌ Error occurred:", error);
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

export default main;