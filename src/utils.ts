import { Keypair } from '@solana/web3.js';
import { Connection, PublicKey, Transaction, TransactionInstruction, sendAndConfirmTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { sha256 } from '@noble/hashes/sha256'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import BN from 'bn.js';

export async function getKeyPairFromPrivateKey(key: string) {
    return Keypair.fromSecretKey(
        new Uint8Array(bs58.decode(key))
    );
}

export async function createTransaction(connection: Connection, instructions: TransactionInstruction[], payer: PublicKey): Promise<Transaction> {
    const transaction = new Transaction().add(...instructions);
    transaction.feePayer = payer;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    return transaction;
}

export async function sendAndConfirmTransactionWrapper(connection: Connection, transaction: Transaction, signers: any[]) {
    try {
        const signature = await sendAndConfirmTransaction(connection, transaction, signers, { skipPreflight: true, preflightCommitment: 'confirmed' });
        console.log('Transaction confirmed with signature:', signature);
        return signature;
    } catch (error) {
        console.error('Error sending transaction:', error);
        return null;
    }
}

export function bufferFromUInt64(value: number | string) {
    let buffer = Buffer.alloc(8);
    buffer.writeBigUInt64LE(BigInt(value));
    return buffer;
}

export function generatePubKey({
    fromPublicKey,
    programId = TOKEN_PROGRAM_ID,
  }: {
    fromPublicKey: PublicKey
    programId: PublicKey
  }) {
    const seed =Keypair.generate().publicKey.toBase58().slice(0, 32)
    
    const publicKey = createWithSeed(fromPublicKey, seed, programId)
    return { publicKey, seed }
  }
  
  function createWithSeed(fromPublicKey: PublicKey, seed: string, programId: PublicKey) {
    const buffer = Buffer.concat([fromPublicKey.toBuffer(), Buffer.from(seed), programId.toBuffer()])
    const publicKeyBytes = sha256(buffer)
    return new PublicKey(publicKeyBytes)
  }
  
  export function bufferFromString(value: string) {
    const buffer = Buffer.alloc(4 + value.length);
    buffer.writeUInt32LE(value.length, 0);
    buffer.write(value, 4);
    return buffer;
}

/**
 * Calculates the token amount that can be bought, given reserves and input amount.
 *
 * @param solInLamports - Amount of SOL to spend (in lamports)
 * @param reserves - Object containing virtualTokenReserves and virtualSolReserves (BN)
 * @param feeBasisPoints - Fee in basis points (e.g. 0 for no fee)
 * @returns BN - Amount of token output
 */
export function calculateTokenAmountForBuy(
  solInLamports: BN,
  reserves: {
    virtualTokenReserves: BN;
    virtualSolReserves: BN;
  },
  feeBasisPoints: number
): BN {
  if (solInLamports.eq(new BN(0)) || !reserves) {
    return new BN(0);
  }

  const product = reserves.virtualSolReserves.mul(reserves.virtualTokenReserves);
  const newVirtualSolReserves = reserves.virtualSolReserves.add(solInLamports);
  const newVirtualTokenReserves = product.div(newVirtualSolReserves).add(new BN(1));
  let tokenOut = reserves.virtualTokenReserves.sub(newVirtualTokenReserves);
  tokenOut = BN.min(tokenOut, reserves.virtualTokenReserves);

  // Fee deduction
  const fee = tokenOut.mul(new BN(feeBasisPoints)).div(new BN(10000));
  return tokenOut.sub(fee);
}