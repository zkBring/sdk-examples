require('dotenv').config();
import {
  BringSDK
} from 'zkbring-sdk'
import { ethers } from "ethers"

const createDrop = async (sdk: any) => {
  const { txHash, waitForDrop } = await sdk.createDrop({
    token: '0xaebd651c93cd4eae21dd2049204380075548add5',
    expiration: 1742477528995,
    zkPassSchemaId: 'c38b96722bd24b64b8d349ffd6391a8c',
    zkPassAppId: '1',
    maxClaims: BigInt('10'),
    amount: BigInt('100000'),
    title: 'Hello',
    description: ' world!'
  })

  console.log({ txHash })
  console.log("Waiting for drop...")
  const { drop, event } = await waitForDrop()
  console.log("Done waiting for drop")
  console.log({ drop, event })
  return drop
}

const claim = async (sdk: any, dropAddress: string, provider: ethers.ContractRunner) => {
  const drop = await sdk.getDrop(dropAddress)
  await drop.updateWalletOrProvider(provider)
  const recipient = "0xC270728400F64f8DCD2030B589470e4C30F64bbd"

  const claimParams = {
    "webproof": {
      "taskId": "ef8a0d882fbf477b803e48dcb8de08e1",
      "publicFields": [],
      "allocatorAddress": "0x19a567b3b212a5b35bA0E3B600FbEd5c2eE9083d",
      "publicFieldsHash": "0xc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6",
      "allocatorSignature": "0xf3aecbae51f4e2f09bcc32a1cd925c926074023b099e8333fb81ec67bb1461c422eee0a273942bd6546db87cd4e2c66695fee59dc180e1124ea37dd036b8e0d91c",
      "uHash": "0xd4b1ee22a7a2eeb2adf53d79b7430a396ffcf699276112fa21949b8ff8fd172c",
      "validatorAddress": "0xb1C4C1E1Cdd5Cf69E27A3A08C8f51145c2E12C6a",
      "validatorSignature": "0x13bfd81ed48c9b5663480631584d29e61c34949debb6f4fa63914982b6dd5b904711da0736a807e6a5047a2c481ff79986a024e8c704fc55d64d78f960421c071b",
      "recipient": "0xe994a5800ca20c4fb40ada179a7b81d245e0b071"
    },
    "ephemeralKey": "0xfbf99f53ddac4666a39a90e7342842aa01ac2f221f9d05ce112501715988155f"
  }


  const { webproof, ephemeralKey } = claimParams

  let isClaimed = await drop.hasUserClaimed({ uHash: webproof.uHash })
  console.log({ isClaimedBefore: isClaimed })

  const { txHash, waitForClaim } = await drop.claim({ webproof, recipient, ephemeralKey })

  console.log({ txHash })
  console.log("Waiting for claim...")
  const event = await waitForClaim()
  console.log("Done waiting for claim")
  console.log(event)

  isClaimed = await drop.hasUserClaimed({ uHash: webproof.uHash })
  console.log({ isClaimedAfter: isClaimed })
}

// Use a function from your SDK to verify everything is working
const runTest = async () => {
  try {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("PRIVATE_KEY is not defined in the .env file");
    }

    const providerUrl = process.env.JSON_RPC_URL;
    if (!providerUrl) {
      throw new Error("JSON_RPC_URL is not defined in the .env file");
    }

    const provider = new ethers.JsonRpcProvider(providerUrl);
    const wallet = new ethers.Wallet(privateKey, provider)

    const sdk = new BringSDK({
      walletOrProvider: provider
    })
    console.log("successfully initiated SDK")

    let fee;
    fee = await sdk.getFee()
    console.log({ fee })

    const res = await sdk.calculateFee({
      amount: BigInt('10000000'),
      maxClaims: BigInt('10'),
    })
    console.log({ res })

    console.log("factory: ", sdk.dropFactory.target)

    await sdk.updateWalletOrProvider(wallet)

    const drop = await createDrop(sdk)

    //await sdk.updateWalletOrProvider(provider)

    const stakedBefore = await drop.getStakedAmount()
    console.log({ stakedBefore })
    const stakeAmount = "1"


    const approveABI = [
      'function approve(address spender, uint256 amount) public returns (bool)'
    ];

    const bringToken = new ethers.Contract(drop.token, approveABI, wallet);
    const approveTx = await bringToken.approve(drop.address, "2")
    await approveTx.wait()

    const stake = async () => {
      const { txHash, waitForStake } = await drop.stake(stakeAmount)
      console.log({ stakeTxHash: txHash })

      const event = await waitForStake()
      console.log({ event })

      const stakedAfter = await drop.getStakedAmount()
      console.log({ stakedAfter })
    }

    await stake()
    await stake()

    // const { txHash, waitForUpdate } = await drop.updateMetadata({ title: "New Title", description: "New Description" })
    // console.log({ updateTxHash: txHash })
    // 
    // const event = await waitForUpdate()
    // console.log({ event })


    // const { txHash, waitForStop } = await drop.stop()
    // console.log({ StopTxHash: txHash })
    // 
    // const event = await waitForStop()
    // console.log({ event })
    //const dropAddress = "0x7C4c6d471C8C7A6426fb82C159b58788F97b5f0c"
    //await claim(sdk, dropAddress, wallet)

  } catch (error) {
    console.error("Error testing SDK:", error);
  }
}

runTest();
