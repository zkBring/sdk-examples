import "./polyfill";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { BringSDK } from "zkbring-sdk";
import TransgateConnect from "@zkpass/transgate-js-sdk";


function App() {
  const [fee, setFee] = useState<number | null>(null);
  const [sdk, setSdk] = useState<BringSDK | null>(null);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initSDK() {
      try {
        // Create a provider (adjust URL as needed for your network)
        const rpcUrl = process.env.REACT_APP_JSON_RPC_URL;
        if (!rpcUrl) {
          throw new Error("JSON RPC URL not defined in environment variables.");
        }
        // Create a provider with the URL from .env
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        // Create the SDK instance.
        // If you’re using a read-only provider, your SDK will operate in read-only mode.
        const sdkInstance = new BringSDK({
          walletOrProvider: provider,
          transgateModule: TransgateConnect
        });

        // Call one of the SDK functions, for example, getFee.
        const feeData = await sdkInstance.getFee();
        setFee(feeData.fee);
        setSdk(sdkInstance);
      } catch (err) {
        console.error("Error initializing SDK:", err);
        setError("Failed to initialize SDK. See console for details.");
      }
    }
    initSDK();
  }, []);

  const handleVerify = async () => {
    if (!sdk) {
      setError("SDK is not initialized");
      return;
    }
    const drop = await sdk.getDrop("0x5867f9e602770702073de8c93e975a9566cd5c82")
    const isTransgateAvailable = await drop.isTransgateAvailable()
    console.log({ isTransgateAvailable })

    if (!isTransgateAvailable) {
      setError("Transgate not installed");
      return;
    }

    try {
      // Call the verify function of the SDK and await its result.
      const result = await drop.generateWebproof();
      const { webproof, ephemeralKey } = result
      console.log({ webproof, ephemeralKey })

      setVerifyResult(result);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>SDK Test App</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {fee !== null ? <p>Fee: {fee}</p> : <p>Loading fee...</p>}
        <button onClick={handleVerify}>Verify</button>
        {verifyResult && (
          <div>
            <h2>Verify Result</h2>
            <pre>{JSON.stringify(verifyResult, null, 2)}</pre>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
