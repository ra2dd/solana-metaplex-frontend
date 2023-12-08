import { useState, useMemo, useCallback } from "react";
import * as web3 from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { generateSigner, transactionBuilder, some } from "@metaplex-foundation/umi";
import { fetchCandyMachine, mintV2, mplCandyMachine, safeFetchCandyGuard } from "@metaplex-foundation/mpl-candy-machine";
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import * as bs58 from "bs58";

export function MintNFTs() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [nft, setNft] = useState(null);

  const endpoint = web3.clusterApiUrl('devnet');
  const candyMachineAddress = new web3.PublicKey(process.env.NEXT_PUBLIC_CANDY_MACHINE_ID);
  const treasury = new web3.PublicKey(process.env.NEXT_PUBLIC_TREASURY);

  const handleClick = async () => {
    if (!connection || !wallet) {
      alert('Connect solana wallet.')
    }

    try {
      const umi = createUmi(endpoint)
        .use(walletAdapterIdentity(wallet))
        .use(mplCandyMachine())

      const candyMachine = await fetchCandyMachine(
        umi,
        candyMachineAddress
      );
      // console.log(candyMachine);

      const candyGuard = await safeFetchCandyGuard(
        umi,
        candyMachine.mintAuthority,
      );

      const nftMint = generateSigner(umi);

      const transaction = await transactionBuilder()
        .add(setComputeUnitLimit(umi, { units: 800_000 }))
        .add(
          mintV2(umi, {
            candyMachine: candyMachine.publicKey,
            candyGuard: candyGuard?.publicKey,
            nftMint,
            collectionMint: candyMachine.collectionMint,
            collectionUpdateAuthority: candyMachine.authority,
            tokenStandard: candyMachine.tokenStandard,
            mintArgs: {
              solPayment: some({ destination: treasury }),
            }
          })
        )

      const { signature } = await transaction.sendAndConfirm(umi, {
        confirm: { commitment: "confirmed" },
      });
      const txid = bs58.encode(signature);
      console.log(`Success, mint: ${txid}`);
      alert('Mint successful');
    } catch(error) {
      console.log(error)
      alert(JSON.stringify(error));
    }
  }

  return(
    <div>
      <button onClick={handleClick}>Mint</button>
      {nft && (
        <div>
          <h1>nft</h1>
          <img
            src={test.jpg}
            alt="nft"/>
        </div>
      )}
    </div>
  );
}