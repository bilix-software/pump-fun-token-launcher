import { Keypair } from '@solana/web3.js';

// Main entry point for the pump-fun-token-launcher package
export { launchToken } from './launch';
export * from './constants';
export * from './utils';

// Type definitions for the package
export interface TokenLaunchConfig {
  name: string;
  symbol: string;
  mintKeypair?: Keypair;
  metadataUrl: string;
  initialBuy?: number;
  slippage?: number;
  priorityFee?: number;
}

export interface LaunchResult {
  success: boolean;
  signature?: string;
  tokenAddress?: string;
  error?: string;
}

// Re-export the main function with better typing
export { launchToken as default } from './launch';
export { validateTokenConfig } from './launch';