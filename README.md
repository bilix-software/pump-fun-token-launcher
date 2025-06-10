[![npm version](https://badge.fury.io/js/pump-fun-token-launcher.svg)](https://badge.fury.io/js/pump-fun-token-launcher)
[![npm downloads](https://img.shields.io/npm/dm/pump-fun-token-launcher.svg)](https://www.npmjs.com/package/pump-fun-token-launcher)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Solana](https://img.shields.io/badge/Solana-Compatible-purple.svg)](https://solana.com/)

# Pump.Fun Token Launcher

A TypeScript/JavaScript package for programmatically launching tokens on pump.fun.

## Installation

```bash
npm install @bilix-software/pump-fun-token-launcher
```

## Usage

### Basic Usage

```typescript
import { launchToken } from '@bilix-software/pump-fun-token-launcher';

const config = {
  name: "My Awesome Token",
  symbol: "MAT",
  description: "A revolutionary token that will change everything",
  imageUrl: "https://example.com/token-image.png",
  initialBuy: 0.5, // SOL amount for initial buy
  slippage: 5, // 5% slippage tolerance
  priorityFee: 0.001 // SOL amount for priority fee
};

const privateKey = "your_base64_encoded_private_key"; // also supports base58

try {
  const result = await launchToken(config, privateKey);
  
  if (result.success) {
    console.log("Token launched successfully!");
    console.log("Token Address:", result.tokenAddress);
    console.log("Transaction Signature:", result.signature);
  } else {
    console.error("Launch failed:", result.error);
  }
} catch (error) {
  console.error("Error:", error);
}
```

### Advanced Usage with Custom RPC

```typescript
import { launchToken, TokenLaunchConfig } from '@bilix-software/pump-fun-token-launcher';
import { Keypair } from '@solana/web3.js';

const config: TokenLaunchConfig = {
  name: "My Token",
  symbol: "MTK",
  description: "Token description",
  initialBuy: 1.0,
  slippage: 3,
  priorityFee: 0.005
};

// You can pass a Keypair instead of a string
const keyPair = Keypair.generate();
const customRpcUrl = "https://your-custom-rpc-endpoint.com";

const result = await launchToken(config, keyPair, customRpcUrl);
```

### Using Individual Utilities

```typescript
import { validateTokenConfig, GLOBAL, PUMP_FUN_PROGRAM } from '@bilix-software/pump-fun-token-launcher';

// Validate configuration before launching
try {
  const isValid = validateTokenConfig(config);
  console.log("Configuration is valid:", isValid);
} catch (error) {
  console.error("Invalid configuration:", error.message);
}

// Access constants
console.log("Global Address:", GLOBAL.toString());
console.log("Pump Fun Program:", PUMP_FUN_PROGRAM.toString());
```

## API Reference

### `launchToken(config, privateKey, rpcUrl?)`

Launches a new token on pump.fun.

**Parameters:**
- `config` (TokenLaunchConfig): Token configuration object
- `privateKey` (string | Keypair): Base64/Base58 encoded private key or Keypair instance
- `rpcUrl` (string, optional): Custom Solana RPC URL

**Returns:** `Promise<LaunchResult>`

### `TokenLaunchConfig`

```typescript
interface TokenLaunchConfig {
  name: string;           // Token name (required)
  symbol: string;         // Token symbol (required, max 10 chars)
  description: string;    // Token description (required)
  imageUrl?: string;      // Token image URL (optional)
  initialBuy?: number;    // Initial buy amount in SOL (default: 0.1)
  slippage?: number;      // Slippage tolerance % (default: 5)
  priorityFee?: number;   // Priority fee in SOL (default: 0.001)
}
```

### `LaunchResult`

```typescript
interface LaunchResult {
  success: boolean;       // Whether the launch was successful
  signature?: string;     // Transaction signature (if successful)
  tokenAddress?: string;  // Created token address (if successful)
  error?: string;         // Error message (if failed)
}
```

### `validateTokenConfig(config)`

Validates a token configuration object.

**Parameters:**
- `config` (TokenLaunchConfig): Configuration to validate

**Returns:** `boolean` - Returns true if valid, throws error if invalid

## Environment Setup

1. Ensure you have a Solana wallet with sufficient SOL for:
   - Transaction fees
   - Initial token purchase (if specified)
   - Priority fees

2. Your private key should be base64 or base58 encoded or you can pass a Keypair object directly.

## Error Handling

The package includes comprehensive error handling:

```typescript
const result = await launchToken(config, privateKey);

if (!result.success) {
  switch (result.error) {
    case 'Token name and symbol are required':
      // Handle missing required fields
      break;
    case 'Insufficient balance':
      // Handle insufficient wallet balance
      break;
    default:
      // Handle other errors
      console.error('Launch failed:', result.error);
  }
}
```

## Development

### Building from Source

```bash
git clone https://github.com/bilix-software/pump-fun-token-launcher.git
cd pump-fun-token-launcher
npm install
npm run build
```

### Running the Example

```bash
npm run example
```

## Requirements

- Node.js 16 or later
- A Solana wallet with sufficient SOL balance
- Valid Solana RPC endpoint access

## License

MIT License - see LICENSE file for details.

## Support

For issues and support:
- GitHub Issues: https://github.com/bilix-software/pump-fun-token-launcher/issues
- Telegram: https://t.me/bilixsoftware
- Email: info@bilix.io

## Contributing

Contributions are welcome! Please read the contributing guidelines and submit pull requests for any improvements.

## Tips
JATt1ta9GcbVMThdL18rXUqHn3toCMjWkHWtxM5WN3ec

