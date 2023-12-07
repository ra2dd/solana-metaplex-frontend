import { useState } from "react";
import { Metaplex, createAuctionHouseBuilder } from "@metaplex-foundation/js";
import * as web3 from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

export function MintNFTs() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [nft, setNft] = useState(null);

  const metaplex = Metaplex.make(connection);
  const candyMachineAddress = new web3.PublicKey(process.env.NEXT_PUBLIC_CANDY_MACHINE_ID);

  let candyMachine;
  let walletBalance;

  const checkEligibility = async () => {
    candyMachine = await metaplex
    .candyMachines()
    .findByAddress({ address: candyMachineAddress})
  }

  const handleClick = async () => {
    if (!connection || !publicKey) {
      alert('Connect solana wallet.')
    }
    
    await checkEligibility();
    console.log(candyMachine)

    const { nft } = await metaplex.candyMachines().mint({
      candyMachine,
      collectionUpdateAuthority: candyMachine.authorityAddress
    });

    console.log(nft);
    setNft(nft);
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