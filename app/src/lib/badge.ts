import type { WalletContextState } from "@solana/wallet-adapter-react";

/**
 * Mint the Champion Badge as a 1/1 Metaplex NFT, signed by the connected wallet
 * (devnet). Metadata + image are served from our own API, so no Arweave/IPFS
 * upload is needed. Heavy Metaplex deps are dynamically imported so they never
 * hit the initial page bundle.
 */
export async function mintChampionBadge(opts: {
  endpoint: string;
  wallet: WalletContextState;
  roomCode: string;
  origin: string;
}): Promise<{ mint: string; signature: string }> {
  const [{ createUmi }, { walletAdapterIdentity }, { createNft, mplTokenMetadata }, umiCore, serializers] =
    await Promise.all([
      import("@metaplex-foundation/umi-bundle-defaults"),
      import("@metaplex-foundation/umi-signer-wallet-adapters"),
      import("@metaplex-foundation/mpl-token-metadata"),
      import("@metaplex-foundation/umi"),
      import("@metaplex-foundation/umi/serializers"),
    ]);

  const umi = createUmi(opts.endpoint)
    .use(mplTokenMetadata())
    .use(walletAdapterIdentity(opts.wallet));

  const mint = umiCore.generateSigner(umi);
  const uri = `${opts.origin}/api/badge/${opts.roomCode}`;

  const result = await createNft(umi, {
    mint,
    name: "GroupStage Champion", // on-chain name (≤32 chars); full title lives in the JSON
    symbol: "GSCHAMP",
    uri,
    sellerFeeBasisPoints: umiCore.percentAmount(0),
    isMutable: true,
  }).sendAndConfirm(umi, { confirm: { commitment: "confirmed" } });

  const signature = serializers.base58.deserialize(result.signature)[0];
  return { mint: mint.publicKey.toString(), signature };
}
