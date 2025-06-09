import { createTransaction, sendAndConfirmTransactionWrapper, bufferFromUInt64, bufferFromString } from './utils';
import web3, { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID,createAssociatedTokenAccountInstruction,getAssociatedTokenAddress } from '@solana/spl-token';
import { TokenLaunchConfig, LaunchResult } from './index';
import { COMPUTE_BUDGET_PROGRAM_ID, GLOBAL, MINT_AUTHORITY, MPL_TOKEN_METADATA, PUMP_FUN_ACCOUNT, PUMP_FUN_PROGRAM, RENT, SYSTEM_PROGRAM} from './constants';
import { calculateTokenAmountForBuy, getKeyPairFromPrivateKey } from './utils';
import BN from 'bn.js';

/**
 * Launch a new token on pump.fun
 * @param config - Token configuration object
 * @param privateKey - Base58 encoded private key or Keypair instance
 * @param rpcUrl - Solana RPC URL (optional, defaults to mainnet)
 * @returns Promise<LaunchResult> - Result of the token launch
 */
export async function launchToken(
  config: TokenLaunchConfig,
  privateKey: string | Keypair,
  rpcUrl?: string
): Promise<LaunchResult> {
    try {
        // Validate required config parameters
        if (!config.name || !config.symbol || !config.metadataUrl) {
            throw new Error('Token name and symbol are required');
        }

        // Initialize connection
        const connection = new Connection(
        rpcUrl || 'https://api.mainnet-beta.solana.com',
        'confirmed'
        );

        // Handle private key - convert string to Keypair if needed
        let keyPair: Keypair;
        if (typeof privateKey === 'string') {
            try{
                keyPair = Keypair.fromSecretKey(
                    Buffer.from(privateKey, 'base64')
                );
            }
            catch(error) {
                keyPair = await getKeyPairFromPrivateKey(privateKey);
            }
        } else {
            keyPair = privateKey;
        }

        // Set default values
        const launchConfig = {
            initialBuy: config.initialBuy || 0,
            slippage: config.slippage || 5,
            priorityFee: config.priorityFee || 0.001,
            ...config
        };
        const { name, symbol, metadataUrl, initialBuy, slippage, priorityFee, mintKeypair } = launchConfig;

        const payer = keyPair;
        const owner = payer.publicKey;
        //Create new wallet to be used as mint
        let mint;
        if(!mintKeypair) {
            const genMint = Keypair.generate();
            mint = genMint;
        }
        else {
            mint = mintKeypair;
        }

        const [bondingCurve, bondingCurveBump] = await PublicKey.findProgramAddress(
            [Buffer.from("bonding-curve"), mint.publicKey.toBuffer()],
            PUMP_FUN_PROGRAM
        );

        const [associatedBondingCurve, associatedBondingCurveBump] = PublicKey.findProgramAddressSync(
            [
                bondingCurve.toBuffer(),
                new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").toBuffer(),
                mint.publicKey.toBuffer()
            ],
            new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
        );

        const [metadata, metadataBump] = await PublicKey.findProgramAddress(
            [Buffer.from("metadata"), MPL_TOKEN_METADATA.toBuffer(), mint.publicKey.toBuffer()],
            MPL_TOKEN_METADATA
        );

         const [creatorVault] = await PublicKey.findProgramAddress(
            [Buffer.from('creator-vault'), owner.toBuffer()],
            PUMP_FUN_PROGRAM
        );

        const txBuilder = new web3.Transaction();

        // Add compute budget program instructions for priority fee
        if (priorityFee > 0) {
            const computeUnitLimitIx = web3.ComputeBudgetProgram.setComputeUnitLimit({
                units: 300_000
            });
            txBuilder.add(computeUnitLimitIx);
            
            const microLamports = BigInt(Math.floor((priorityFee / 3) * 1_000_000_000)); // Convert SOL to micro-lamports
            const computeUnitPriceIx = web3.ComputeBudgetProgram.setComputeUnitPrice({
                microLamports
            });
            txBuilder.add(computeUnitPriceIx);
        }

        const keys = [
            { pubkey: mint.publicKey, isSigner: true, isWritable: true }, // Mint account
            { pubkey: MINT_AUTHORITY, isSigner: false, isWritable: false }, // Mint authority
            { pubkey: bondingCurve, isSigner: false, isWritable: true }, // Bonding curve PDA
            { pubkey: associatedBondingCurve, isSigner: false, isWritable: true }, // Associated bonding curve PDA
            { pubkey: GLOBAL, isSigner: false, isWritable: false }, // Global config
            { pubkey: MPL_TOKEN_METADATA, isSigner: false, isWritable: false }, // Metadata program ID
            { pubkey: metadata, isSigner: false, isWritable: true }, // Metadata PDA
            { pubkey: owner, isSigner: true, isWritable: true }, // Owner account
            { pubkey: SYSTEM_PROGRAM, isSigner: false, isWritable: false }, // System program
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // Token program
            { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // Associated token account program
            { pubkey: RENT, isSigner: false, isWritable: false }, // Rent sysvar
            { pubkey: PUMP_FUN_ACCOUNT, isSigner: false, isWritable: false }, // Pump fun account
            { pubkey: PUMP_FUN_PROGRAM, isSigner: false, isWritable: false } // Pump fun program ID
        ];

        const nameBuffer = bufferFromString(name);
        const symbolBuffer = bufferFromString(symbol);
        const uriBuffer = bufferFromString(metadataUrl);

        const data = Buffer.concat([
            Buffer.from("181ec828051c0777", "hex"),
            nameBuffer,
            symbolBuffer,
            uriBuffer,
            payer.publicKey.toBuffer()
        ]);

        const instruction = new web3.TransactionInstruction({
            keys: keys,
            programId: PUMP_FUN_PROGRAM,
            data: data
        });

        txBuilder.add(instruction);

        // 🟩 If devBuyAmount is set, add the dev buy instruction to this same transaction
        if (initialBuy && initialBuy> 0) {
            const tokenAccount = await getAssociatedTokenAddress(
                mint.publicKey,
                owner,
                false
            );

            const tokenAccountInfo = await connection.getAccountInfo(tokenAccount);
            if (!tokenAccountInfo) {
                txBuilder.add(
                createAssociatedTokenAccountInstruction(
                    owner,
                    tokenAccount,
                    owner,
                    mint.publicKey
                )
                );
            }

            const solInLamports = initialBuy *  web3.LAMPORTS_PER_SOL;
            const reserves = {
                virtualTokenReserves: new BN(1073000000000000),
                virtualSolReserves: new BN(30000000000)
            };
            const tokenOut = calculateTokenAmountForBuy(new BN(solInLamports), reserves, 0);
            const solInWithSlippage = initialBuy * (1 + slippage / 100);
            const maxSolCost = Math.floor(solInWithSlippage *  web3.LAMPORTS_PER_SOL);

            const buyKeys = [
                { pubkey: GLOBAL, isSigner: false, isWritable: false },
                { pubkey: new PublicKey('G5UZAVbAf46s7cKWoyKu8kYTip9DGTpbLZ2qa9Aq69dP'), isSigner: false, isWritable: true },
                { pubkey: mint.publicKey, isSigner: false, isWritable: false },
                { pubkey: bondingCurve, isSigner: false, isWritable: true },
                { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
                { pubkey: tokenAccount, isSigner: false, isWritable: true },
                { pubkey: owner, isSigner: false, isWritable: true },
                { pubkey: SYSTEM_PROGRAM, isSigner: false, isWritable: false },
                { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                { pubkey: creatorVault, isSigner: false, isWritable: true },
                { pubkey: PUMP_FUN_ACCOUNT, isSigner: false, isWritable: false },
                { pubkey: PUMP_FUN_PROGRAM, isSigner: false, isWritable: false }
            ];

            const buyData = Buffer.concat([
                bufferFromUInt64('16927863322537952870'), // instruction code for "buy"
                bufferFromUInt64(tokenOut.toString()),
                bufferFromUInt64(maxSolCost)
            ]);

            txBuilder.add(new web3.TransactionInstruction({
                keys: buyKeys,
                programId: PUMP_FUN_PROGRAM,
                data: buyData
            }));
        }

        const transaction = await createTransaction(connection, txBuilder.instructions, payer.publicKey);
        const signature = await sendAndConfirmTransactionWrapper(connection, transaction, [payer, mint]);
        return {
            success: true,
            signature: signature ?? undefined,
            tokenAddress: mint.publicKey.toString()
        };
    }
    catch(error: any) {
        console.error('Error launching token:', error);
        return {
            success: false,
            error: error.message || 'Unknown error occurred'
        };
    }
  }

  /**
 * Validate token launch configuration
 * @param config - Token configuration to validate
 * @returns boolean - true if valid, throws error if invalid
 */
export function validateTokenConfig(config: TokenLaunchConfig): boolean {
  if (!config.name || config.name.trim().length === 0) {
    throw new Error('Token name is required');
  }
  
  if (!config.symbol || config.symbol.trim().length === 0) {
    throw new Error('Token symbol is required');
  }
  
  if (config.symbol.length > 10) {
    throw new Error('Token symbol must be 10 characters or less');
  }
  
  if (config.initialBuy && config.initialBuy < 0) {
    throw new Error('Initial buy amount must be positive');
  }
  
  if (config.slippage && (config.slippage < 0 || config.slippage > 100)) {
    throw new Error('Slippage must be between 0 and 100');
  }
  
  return true;
}