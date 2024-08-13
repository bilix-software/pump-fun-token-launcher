import { getKeyPairFromPrivateKey, createTransaction, sendAndConfirmTransactionWrapper, bufferFromUInt64, bufferFromString } from './utils';
import web3, { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { COMPUTE_BUDGET_PROGRAM_ID, GLOBAL, MINT_AUTHORITY, MPL_TOKEN_METADATA, PUMP_FUN_ACCOUNT, PUMP_FUN_PROGRAM, RENT, SYSTEM_PROGRAM } from './constants';

export async function launchToken(deployerPrivatekey: string, name: string, symbol: string, uri: string) {
    const connection = new Connection(
        clusterApiUrl("mainnet-beta"),
        'confirmed'
    );

    const payer = await getKeyPairFromPrivateKey(deployerPrivatekey);
    const owner = payer.publicKey;

    //Create new wallet to be used as mint
    const mint = Keypair.generate();

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

    const txBuilder = new web3.Transaction();

    // Adding the Compute Budget instruction
    const computeBudgetInstruction = new web3.TransactionInstruction({
        keys: [],
        programId: COMPUTE_BUDGET_PROGRAM_ID,
        data: Buffer.concat([
            Buffer.from(Uint8Array.of(3)), // discriminator for SetComputeUnitPrice
            bufferFromUInt64(100000) // microLamports
        ])
    });

    txBuilder.add(computeBudgetInstruction);

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
    const uriBuffer = bufferFromString(uri);

    const data = Buffer.concat([
        Buffer.from("181ec828051c0777", "hex"),
        nameBuffer,
        symbolBuffer,
        uriBuffer
    ]);

    const instruction = new web3.TransactionInstruction({
        keys: keys,
        programId: PUMP_FUN_PROGRAM,
        data: data
    });

    txBuilder.add(instruction);

    const transaction = await createTransaction(connection, txBuilder.instructions, payer.publicKey);
    const signature = await sendAndConfirmTransactionWrapper(connection, transaction, [payer, mint]);
    console.log(`Tx confirmed with signature: ${signature}`)
}