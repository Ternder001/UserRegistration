import { createApp } from "@deroll/app";
import { createWallet } from "@deroll/wallet";
import { encodeFunctionData, getAddress, hexToString } from "viem";
import contractAbi from "./abi.json";

var contractAddress = "";

const app = createApp({
  url: process.env.ROLLUP_HTTP_SERVER_URL || "http://127.0.0.1:5004",
});

const wallet = createWallet();
app.addAdvanceHandler(wallet.handler);

app.addInspectHandler(async ({ payload }) => {
  const payloadString = hexToString(payload);
  console.log("payload:", payloadString);
  const jsonPayload = JSON.parse(payloadString);

  if (jsonPayload.method === "set_address") {
    contractAddress = getAddress(jsonPayload.address);
    console.log("Address is now set", contractAddress);
  } else if (jsonPayload.method === "register_user") {
    const { role } = jsonPayload;
    const callData = encodeFunctionData({
      abi: contractAbi,
      functionName: "authenticateUser",
      args: [role],
    });

    app.CreateVoucher({
      destination: contractAddress,
      payload: callData,
    });
  } else if (jsonPayload.method === "subscribe") {
    const { age, sex } = jsonPayload;
    const callData = encodeFunctionData({
      abi: contractAbi,
      functionName: "subscription",
      args: [age, sex],
    });

    app.CreateVoucher({
      destination: contractAddress,
      payload: callData,
    });
  }
  return "accept";
});

app.start().catch((e) => {
  console.error(e);
  process.exit(1);
});
