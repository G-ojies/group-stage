import {
  Connection, PublicKey, Transaction, TransactionInstruction,
} from "@solana/web3.js";

const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

/**
 * Anchor a short attestation on-chain (devnet) via the SPL Memo program.
 * Used to timestamp a room's provably-fair draft and its final standings so the
 * outcome is publicly auditable. Returns the tx signature.
 */
export async function sendMemo(
  connection: Connection,
  payer: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
  memo: string
): Promise<string> {
  const ix = new TransactionInstruction({
    keys: [{ pubkey: payer, isSigner: true, isWritable: true }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memo.slice(0, 560), "utf8"),
  });
  const tx = new Transaction().add(ix);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = payer;
  const signed = await signTransaction(tx);
  const sig = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");
  return sig;
}

export function explorerTx(sig: string): string {
  return `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
}
