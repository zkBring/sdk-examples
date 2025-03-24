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
}

const claim = async (sdk: any) => {
  const drop = await sdk.getDrop("0xaA4DF1A560B9262Ce6553db4c0361CFf3Ea7e7EA")
  const recipient = "0xC270728400F64f8DCD2030B589470e4C30F64bbd"

  const claimParams = {
    "webproof": {
      "taskId": "4667b7246d2d4849ba871a44551d0a7c",
      "publicFields": [],
      "allocatorAddress": "0x19a567b3b212a5b35bA0E3B600FbEd5c2eE9083d",
      "publicFieldsHash": "0xc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6",
      "allocatorSignature": "0x41e5370652651e8f0fea0357aba8d2abc6d8f78a05b6f3b70b42ea798ab4758c3219d4107d40fc6c7654c482bd48f06b87c26a90cc77d94e4c27088b5a1eb62f1b",
      "uHash": "0xd4b1ee22a7a2eeb2adf53d79b7430a396ffcf699276112fa21949b8ff8fd172c",
      "validatorAddress": "0xb1C4C1E1Cdd5Cf69E27A3A08C8f51145c2E12C6a",
      "validatorSignature": "0x2e45e4e236f8e2bba835eae0d3da96e9bc4794abf205e2bf5d6ba96834a6a78c074962568e0d8ad17b55f3c8cd4607ac24a3642df7cd8a2241036d08240f262c1b",
      "recipient": "0xf6fdC3F27eEf1EDC236227404582d3F8906eA0CD"
    },
    "ephemeralKey": "0x0961e3f28f9af935a626b0730aabf153fcbc3fb8f10824e6ab5200b9681c01c7"
  }
  const { webproof, ephemeralKey } = claimParams
  const { txHash, waitForClaim } = await drop.claim({ webproof, recipient, ephemeralKey })

  console.log({ txHash })
  console.log("Waiting for claim...")
  const event = await waitForClaim()
  console.log("Done waiting for claim")
  console.log(event)
}


// Use a function from your SDK to verify everything is working
const runTest = async () => {
  try {
    const privateKey = "<YOUR_PRIVATE_KEY>"  //ethers.Wallet.createRandom().privateKey

    const provider = new ethers.JsonRpcProvider("<YOUR_JSON_RPC_URL>");
    const wallet = new ethers.Wallet(privateKey, provider)

    const zkPassAppId = "<YOUR_ZKPASS_ID>"

    const sdk = new BringSDK({
      walletOrProvider: wallet
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

    await createDrop(sdk)
    //await claim(sdk)

  } catch (error) {
    console.error("Error testing SDK:", error);
  }
}

runTest();
