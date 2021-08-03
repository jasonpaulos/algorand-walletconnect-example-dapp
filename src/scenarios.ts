import algosdk from "algosdk";
import { apiGetTxnParams, ChainType } from "./helpers/api";

const testAccounts = [
  algosdk.mnemonicToSecretKey(
    "cannon scatter chest item way pulp seminar diesel width tooth enforce fire rug mushroom tube sustain glide apple radar chronic ask plastic brown ability badge",
  ),
  algosdk.mnemonicToSecretKey(
    "person congress dragon morning road sweet horror famous bomb engine eager silent home slam civil type melt field dry daring wheel monitor custom above term",
  ),
  algosdk.mnemonicToSecretKey(
    "faint protect home drink journey humble tube clinic game rough conduct sell violin discover limit lottery anger baby leaf mountain peasant rude scene abstract casual",
  ),
];

export function signTxnWithTestAccount(txn: algosdk.Transaction): Uint8Array {
  const sender = algosdk.encodeAddress(txn.from.publicKey);

  for (const testAccount of testAccounts) {
    if (testAccount.addr === sender) {
      return txn.signTxn(testAccount.sk);
    }
  }

  throw new Error(`Cannot sign transaction from unknown test account: ${sender}`);
}

export interface IScenarioTxn {
  txn: algosdk.Transaction;
  signers?: string[];
  authAddr?: string;
  message?: string;
}

export type ScenarioReturnType = IScenarioTxn[][];

export type Scenario = (chain: ChainType, address: string) => Promise<ScenarioReturnType>;

export enum AssetTransactionType {
  Transfer = "asset-transfer",
  OptIn = "asset-opt-in",
  Close = "asset-close"
}

function getAssetIndex(chain: ChainType, type: AssetTransactionType): number {
  if (chain === ChainType.MainNet) {
    if (type === AssetTransactionType.Transfer) {
      return 604; // IanCoin
    } else if (type === AssetTransactionType.Close) {
      return 672; // RotemCoin
    } else {
      return 312769; // Tether USDt
    }
  }

  if (type === AssetTransactionType.Transfer) {
    return 11711; // HipoCoin
  } else if (type === AssetTransactionType.Close) {
    return 180132; // testasset2
  } else {
    return 135270; // Turkish Lira
  }
}

const singlePayTxn: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100000,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txnsToSign = [{ txn, message: "This is a transaction message" }];
  return [txnsToSign];
};

const singlePayTxnWithClose: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100000,
    note: new Uint8Array(Buffer.from("example note value")),
    closeRemainderTo: testAccounts[1].addr,
    suggestedParams,
  });

  const txnsToSign = [{ txn }];
  return [txnsToSign];
};

const singlePayTxnWithRekey: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100000,
    note: new Uint8Array(Buffer.from("example note value")),
    rekeyTo: testAccounts[2].addr,
    suggestedParams,
  });

  const txnsToSign = [{ txn }];
  return [txnsToSign];
};

const singlePayTxnWithRekeyAndClose: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100000,
    note: new Uint8Array(Buffer.from("example note value")),
    rekeyTo: testAccounts[2].addr,
    closeRemainderTo: testAccounts[1].addr,
    suggestedParams,
  });

  const txnsToSign = [{ txn }];
  return [txnsToSign];
};

const singlePayTxnWithInvalidAuthAddress: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100000,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txnsToSign = [{ txn, message: "This is a transaction message", authAddr: "INVALID_ADDRESS" }];
  return [txnsToSign];
};

const singleAssetOptInTxn: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);
  const assetIndex = getAssetIndex(chain, AssetTransactionType.OptIn);

  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: address,
    amount: 0,
    assetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txnsToSign = [{ txn }];
  return [txnsToSign];
};

const singleAssetOptInTxnToInvalidAsset: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);
  const assetIndex = 100;

  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: address,
    amount: 0,
    assetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txnsToSign = [{ txn }];
  return [txnsToSign];
};

const singleAssetTransferTxn: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);
  const assetIndex = getAssetIndex(chain, AssetTransactionType.Transfer);

  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 1000000,
    assetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txnsToSign = [{ txn }];
  return [txnsToSign];
};

const singleAssetTransferTxnWithClose: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);
  const assetIndex = getAssetIndex(chain, AssetTransactionType.Transfer);

  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 1000000,
    assetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    closeRemainderTo: testAccounts[1].addr,
    suggestedParams,
  });

  const txnsToSign = [{ txn, message: "This is a transaction message" }];
  return [txnsToSign];
};

const singleInvalidAssetTransferTxn: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);
  const assetIndex = 100; // Invalid asset id

  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 1000000,
    assetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txnsToSign = [{ txn }];
  return [txnsToSign];
};

const singleAppOptIn: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const appIndex = 200;

  const txn = algosdk.makeApplicationOptInTxnFromObject({
    from: address,
    appIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    appArgs: [Uint8Array.from([0]), Uint8Array.from([0, 1])],
    suggestedParams,
  });

  const txnsToSign = [{ txn }];
  return [txnsToSign];
};

const singleAppCall: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const appIndex = 200;

  const txn = algosdk.makeApplicationNoOpTxnFromObject({
    from: address,
    appIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    appArgs: [Uint8Array.from([0]), Uint8Array.from([0, 1])],
    suggestedParams,
  });

  const txnsToSign = [{ txn }];
  return [txnsToSign];
};

const singleAppCallWithRekey: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const appIndex = 200;

  const txn = algosdk.makeApplicationNoOpTxnFromObject({
    from: address,
    appIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    appArgs: [Uint8Array.from([0]), Uint8Array.from([0, 1])],
    rekeyTo: testAccounts[2].addr,
    suggestedParams,
  });

  const txnsToSign = [{ txn }];
  return [txnsToSign];
};

const singleAppCloseOut: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const appIndex = 200;

  const txn = algosdk.makeApplicationCloseOutTxnFromObject({
    from: address,
    appIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    appArgs: [Uint8Array.from([0]), Uint8Array.from([0, 1])],
    suggestedParams,
  });

  const txnsToSign = [{ txn, message: "This is a transaction message" }];
  return [txnsToSign];
};

const sign1FromGroupTxn: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);
  const transferAssetIndex = getAssetIndex(chain, AssetTransactionType.Transfer);
  const optInAssetIndex = getAssetIndex(chain, AssetTransactionType.OptIn);

  const txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: address,
    amount: 0,
    assetIndex: optInAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: testAccounts[0].addr,
    to: address,
    amount: 1000000,
    assetIndex: transferAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txnsToSign = [
    { txn: txn1 },
    { txn: txn2, signers: [] },
  ];

  algosdk.assignGroupID(txnsToSign.map(toSign => toSign.txn));

  return [txnsToSign];
};

const sign2FromGroupTxn: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);
  const transferAssetIndex = getAssetIndex(chain, AssetTransactionType.Transfer);
  const optInAssetIndex = getAssetIndex(chain, AssetTransactionType.OptIn);

  const txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: address,
    amount: 0,
    assetIndex: optInAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: testAccounts[0].addr,
    to: address,
    amount: 1000000,
    assetIndex: transferAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn3 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 500000,
    note: new Uint8Array(Buffer.from("this is a payment txn")),
    suggestedParams,
  });

  const txnsToSign = [
    { txn: txn1 },
    { txn: txn2, signers: [] },
    { txn: txn3, message: "This is a transaction message" },
  ];

  algosdk.assignGroupID(txnsToSign.map(toSign => toSign.txn));

  return [txnsToSign];
};

const signGroupWithPayOptinTransfer: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);
  const transferAssetIndex = getAssetIndex(chain, AssetTransactionType.Transfer);
  const optInAssetIndex = getAssetIndex(chain, AssetTransactionType.OptIn);

  const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 500000,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: address,
    amount: 0,
    assetIndex: optInAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn3 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 1000000,
    assetIndex: transferAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txnsToSign = [
    { txn: txn1 },
    { txn: txn2 },
    { txn: txn3 },
  ];

  algosdk.assignGroupID(txnsToSign.map(toSign => toSign.txn));

  return [txnsToSign];
};

const signGroupWithPayRekey: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 500000,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 500000,
    note: new Uint8Array(Buffer.from("example note value")),
    rekeyTo: testAccounts[2].addr,
    suggestedParams,
  });

  const txnsToSign = [
    { txn: txn1 },
    { txn: txn2, message: "This is a transaction message" },
  ];

  algosdk.assignGroupID(txnsToSign.map(toSign => toSign.txn));

  return [txnsToSign];
};

const signTxnWithAssetClose: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);
  const assetIndex = getAssetIndex(chain, AssetTransactionType.Transfer);
  const closeAssetIndex = getAssetIndex(chain, AssetTransactionType.Close);

  const txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 50,
    assetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 50,
    assetIndex: closeAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    closeRemainderTo: testAccounts[1].addr,
    suggestedParams,
  });

  const txnsToSign = [
    { txn: txn1 },
    { txn: txn2 },
  ];

  algosdk.assignGroupID(txnsToSign.map(toSign => toSign.txn));

  return [txnsToSign];
};

const signTxnWithRekey: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);
  const assetIndex = getAssetIndex(chain, AssetTransactionType.Transfer);

  const txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 50,
    assetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 50,
    assetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    rekeyTo: testAccounts[2].addr,
    suggestedParams,
  });

  const txnsToSign = [
    { txn: txn1, message: "This is a transaction message" },
    { txn: txn2 },
  ];

  algosdk.assignGroupID(txnsToSign.map(toSign => toSign.txn));

  return [txnsToSign];
};

const signTxnWithRekeyAndAssetClose: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);
  const closeAssetIndex = getAssetIndex(chain, AssetTransactionType.Close);
  const assetIndex = getAssetIndex(chain, AssetTransactionType.Transfer);

  const txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    assetIndex,
    amount: 10,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 20,
    assetIndex: closeAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    closeRemainderTo: testAccounts[1].addr,
    suggestedParams,
  });

  const txn3 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 30,
    assetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    rekeyTo: testAccounts[2].addr,
    suggestedParams,
  });

  const txn4 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 40,
    assetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    closeRemainderTo: testAccounts[1].addr,
    rekeyTo: testAccounts[2].addr,
    suggestedParams,
  });

  const txnsToSign = [
    { txn: txn1, message: "This is a transaction message" },
    { txn: txn2 },
    { txn: txn3 },
    { txn: txn4, message: "This is a transaction message" },
  ];

  algosdk.assignGroupID(txnsToSign.map(toSign => toSign.txn));

  return [txnsToSign];
};

const signGroupOf7: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);
  const transferAssetIndex = getAssetIndex(chain, AssetTransactionType.Transfer);
  const optInAssetIndex = getAssetIndex(chain, AssetTransactionType.OptIn);
  const closeAssetIndex = getAssetIndex(chain, AssetTransactionType.Close);

  const optIn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: address,
    amount: 0,
    assetIndex: optInAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const assetXfer = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 50,
    assetIndex: transferAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const assetClose = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 50,
    assetIndex: closeAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    closeRemainderTo: testAccounts[1].addr,
    suggestedParams,
  });

  const payment = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 500000,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const accountClose = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 0,
    note: new Uint8Array(Buffer.from("example note value")),
    closeRemainderTo: testAccounts[1].addr,
    suggestedParams,
  });

  const accountRekey = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 1000,
    note: new Uint8Array(Buffer.from("example note value")),
    rekeyTo: testAccounts[2].addr,
    suggestedParams,
  });

  const accountRekeyAndClose = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 50000,
    note: new Uint8Array(Buffer.from("example note value")),
    closeRemainderTo: testAccounts[1].addr,
    rekeyTo: testAccounts[2].addr,
    suggestedParams,
  });

  const txnsToSign = [
    { txn: optIn },
    { txn: assetXfer },
    { txn: assetClose },
    { txn: payment },
    { txn: accountClose },
    { txn: accountRekey },
    { txn: accountRekeyAndClose },
  ];

  algosdk.assignGroupID(txnsToSign.map(toSign => toSign.txn));

  return [txnsToSign];
};

const fullTxnGroup: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const txnsToSign: Array<{ txn: algosdk.Transaction; signers?: [string] }> = [];

  for (let i = 0; i < 8; i++) {
    const assetIndex = 100 + i;

    const optIn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: address,
      to: address,
      amount: 0,
      assetIndex,
      note: new Uint8Array(Buffer.from("example note value")),
      suggestedParams,
    });

    const closeOut = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: address,
      to: address,
      amount: 0,
      assetIndex,
      note: new Uint8Array(Buffer.from("example note value")),
      closeRemainderTo: testAccounts[1].addr,
      suggestedParams,
    });

    txnsToSign.push({ txn: optIn });
    txnsToSign.push({ txn: closeOut });
  }

  algosdk.assignGroupID(txnsToSign.map(toSign => toSign.txn));

  return [txnsToSign];
};

const multipleNonAtomicTxns: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100001,
    note: new Uint8Array(Buffer.from("txn 1")),
    suggestedParams,
  });

  const txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100002,
    note: new Uint8Array(Buffer.from("txn 2")),
    suggestedParams,
  });

  const txn3 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100003,
    note: new Uint8Array(Buffer.from("txn 3")),
    suggestedParams,
  });

  const group1 = [{ txn: txn1 }];
  // not necessary to do this, but let's test it works
  algosdk.assignGroupID(group1.map(toSign => toSign.txn));

  const group2 = [{ txn: txn2, message: "This is a transaction message" }];

  const group3 = [{ txn: txn3 }];

  return [group1, group2, group3];
};

const multipleNonAtomicTxnsForOnlyAssets: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);
  const optInAssetIndex = getAssetIndex(chain, AssetTransactionType.OptIn);
  const transferAssetIndex =  getAssetIndex(chain, AssetTransactionType.Transfer);

  const txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: address,
    amount: 0,
    assetIndex: optInAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: testAccounts[0].addr,
    to: address,
    amount: 10000,
    assetIndex: transferAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn3 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: testAccounts[0].addr,
    to: address,
    amount: 30000,
    assetIndex: transferAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const group1 = [{ txn: txn1 }];
  // not necessary to do this, but let's test it works
  algosdk.assignGroupID(group1.map(toSign => toSign.txn));

  const group2 = [{ txn: txn2 }];

  const group3 = [{ txn: txn3, message: "This is a transaction message" }];

  return [group1, group2, group3];
};

const multipleNonAtomicTxnsMixed: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);
  const optInAssetIndex = getAssetIndex(chain, AssetTransactionType.OptIn);
  const transferAssetIndex =  getAssetIndex(chain, AssetTransactionType.Transfer);

  const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100001,
    note: new Uint8Array(Buffer.from("txn 1")),
    suggestedParams,
  });

  const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: address,
    amount: 0,
    assetIndex: optInAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn3 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: testAccounts[0].addr,
    to: address,
    amount: 10000,
    assetIndex: transferAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const group1 = [{ txn: txn1 }];
  // not necessary to do this, but let's test it works
  algosdk.assignGroupID(group1.map(toSign => toSign.txn));

  const group2 = [{ txn: txn2 }];

  const group3 = [{ txn: txn3 }];

  return [group1, group2, group3];
};

const atomicGroupAndNonAtomicTxnsForOnlyPayment: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100001,
    note: new Uint8Array(Buffer.from("atomic group 1 txn 1")),
    suggestedParams,
  });

  const txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100002,
    note: new Uint8Array(Buffer.from("atomic group 2 txn 2")),
    suggestedParams,
  });

  const txn3 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100003,
    note: new Uint8Array(Buffer.from("txn 3")),
    suggestedParams,
  });

  const txn4 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100004,
    note: new Uint8Array(Buffer.from("txn 4")),
    suggestedParams,
  });

  const group1 = [
    { txn: txn1, message: "This is a transaction message" },
    { txn: txn2, message: "This is a transaction message" },
  ];
  algosdk.assignGroupID(group1.map(toSign => toSign.txn));

  const group2 = [{ txn: txn3 }];

  const group3 = [{ txn: txn4 }];

  return [group1, group2, group3];
};

const atomicGroupAndNonAtomicTxnsMixed: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain); 
  const optInAssetIndex = getAssetIndex(chain, AssetTransactionType.OptIn);
  const transferAssetIndex =  getAssetIndex(chain, AssetTransactionType.Transfer);

  const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100001,
    note: new Uint8Array(Buffer.from("atomic group 1 txn 1")),
    suggestedParams,
  });


  const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: address,
    amount: 0,
    assetIndex: optInAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn3 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: testAccounts[0].addr,
    to: address,
    amount: 10000,
    assetIndex: transferAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn4 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100004,
    note: new Uint8Array(Buffer.from("txn 4")),
    suggestedParams,
  });

  const group1 = [
    { txn: txn1 },
    { txn: txn2 },
  ];
  algosdk.assignGroupID(group1.map(toSign => toSign.txn));

  const group2 = [{ txn: txn3, message: "This is a transaction message" }];

  const group3 = [{ txn: txn4 }];

  return [group1, group2, group3];
};

const multipleAtomicGroupsForOnlyPayment: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100001,
    note: new Uint8Array(Buffer.from("atomic group 1 txn 1")),
    suggestedParams,
  });

  const txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100002,
    note: new Uint8Array(Buffer.from("atomic group 1 txn 2")),
    suggestedParams,
  });

  const txn3 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100003,
    note: new Uint8Array(Buffer.from("atomic group 2 txn 1")),
    suggestedParams,
  });

  const txn4 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100004,
    note: new Uint8Array(Buffer.from("atomic group 2 txn 2")),
    suggestedParams,
  });

  const group1 = [
    { txn: txn1 },
    { txn: txn2 },
  ];
  algosdk.assignGroupID(group1.map(toSign => toSign.txn));

  const group2 = [
    { txn: txn3 },
    { txn: txn4 },
  ];
  algosdk.assignGroupID(group2.map(toSign => toSign.txn));

  return [group1, group2];
};

const multipleAtomicGroupsForOnlyAssets: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);
  const optInAssetIndex = getAssetIndex(chain, AssetTransactionType.OptIn);
  const transferAssetIndex =  getAssetIndex(chain, AssetTransactionType.Transfer);

  const txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: address,
    amount: 0,
    assetIndex: optInAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: testAccounts[0].addr,
    to: address,
    amount: 10000,
    assetIndex: transferAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn3 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: address,
    amount: 0,
    assetIndex: optInAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn4 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: testAccounts[0].addr,
    to: address,
    amount: 2000,
    assetIndex: transferAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const group1 = [
    { txn: txn1 },
    { txn: txn2 },
  ];
  algosdk.assignGroupID(group1.map(toSign => toSign.txn));

  const group2 = [
    { txn: txn3 },
    { txn: txn4 },
  ];
  algosdk.assignGroupID(group2.map(toSign => toSign.txn));

  return [group1, group2];
};

const multipleAtomicGroupsWithInvalidAsset: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);
  const invalidAssetIndex = 100;

  const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100001,
    note: new Uint8Array(Buffer.from("atomic group 1 txn 1")),
    suggestedParams,
  });

  const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: testAccounts[0].addr,
    to: address,
    amount: 2000,
    assetIndex: invalidAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });
  const txn3 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100003,
    note: new Uint8Array(Buffer.from("atomic group 2 txn 1")),
    suggestedParams,
  });

  const txn4 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100004,
    note: new Uint8Array(Buffer.from("atomic group 2 txn 2")),
    suggestedParams,
  });

  const group1 = [
    { txn: txn1 },
    { txn: txn2 },
  ];
  algosdk.assignGroupID(group1.map(toSign => toSign.txn));

  const group2 = [
    { txn: txn3 },
    { txn: txn4 },
  ];
  algosdk.assignGroupID(group2.map(toSign => toSign.txn));

  return [group1, group2];
};

const multipleAtomicGroupsMixed1: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);
  const optInAssetIndex = getAssetIndex(chain, AssetTransactionType.OptIn);
  const transferAssetIndex =  getAssetIndex(chain, AssetTransactionType.Transfer);

  const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100001,
    note: new Uint8Array(Buffer.from("atomic group 1 txn 1")),
    suggestedParams,
  });

  const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: testAccounts[0].addr,
    to: address,
    amount: 10000,
    assetIndex: transferAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn3 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: address,
    amount: 0,
    assetIndex: optInAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn4 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100004,
    note: new Uint8Array(Buffer.from("atomic group 2 txn 2")),
    suggestedParams,
  });

  const group1 = [
    { txn: txn1 },
    { txn: txn2 },
  ];
  algosdk.assignGroupID(group1.map(toSign => toSign.txn));

  const group2 = [
    { txn: txn3 },
    { txn: txn4 },
  ];
  algosdk.assignGroupID(group2.map(toSign => toSign.txn));

  return [group1, group2];
};

const multipleAtomicGroupsMixed2: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);
  const optInAssetIndex = getAssetIndex(chain, AssetTransactionType.OptIn);
  const transferAssetIndex =  getAssetIndex(chain, AssetTransactionType.Transfer);

  const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100001,
    note: new Uint8Array(Buffer.from("atomic group 1 txn 1")),
    suggestedParams,
  });

  const txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100002,
    note: new Uint8Array(Buffer.from("atomic group 1 txn 2")),
    suggestedParams,
  });

  const txn3 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: testAccounts[0].addr,
    to: address,
    amount: 2000,
    assetIndex: transferAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const txn4 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: address,
    amount: 0,
    assetIndex: optInAssetIndex,
    note: new Uint8Array(Buffer.from("example note value")),
    suggestedParams,
  });

  const group1 = [
    { txn: txn1 },
    { txn: txn2 },
  ];
  algosdk.assignGroupID(group1.map(toSign => toSign.txn));

  const group2 = [
    { txn: txn3 },
    { txn: txn4 },
  ];
  algosdk.assignGroupID(group2.map(toSign => toSign.txn));

  return [group1, group2];
};

const multipleAtomicGroupSignOnly2: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100001,
    note: new Uint8Array(Buffer.from("atomic group 1 txn 1")),
    suggestedParams,
  });

  const txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100002,
    note: new Uint8Array(Buffer.from("atomic group 2 txn 2")),
    suggestedParams,
  });

  const txn3 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100003,
    note: new Uint8Array(Buffer.from("txn 3")),
    suggestedParams,
  });

  const txn4 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100004,
    note: new Uint8Array(Buffer.from("txn 4")),
    suggestedParams,
  });

  const group1 = [
    { txn: txn1, signers: [] },
    { txn: txn2 },
  ];
  algosdk.assignGroupID(group1.map(toSign => toSign.txn));

  const group2 = [
    { txn: txn3, signers: [] },
    { txn: txn4 },
  ];
  algosdk.assignGroupID(group2.map(toSign => toSign.txn));

  return [group1, group2];
};

const atomicGroupAndNonAtomicTxnsSignOnly2: Scenario = async (
  chain: ChainType,
  address: string,
): Promise<ScenarioReturnType> => {
  const suggestedParams = await apiGetTxnParams(chain);

  const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100001,
    note: new Uint8Array(Buffer.from("atomic group 1 txn 1")),
    suggestedParams,
  });

  const txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100002,
    note: new Uint8Array(Buffer.from("atomic group 2 txn 2")),
    suggestedParams,
  });

  const txn3 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100003,
    note: new Uint8Array(Buffer.from("txn 3")),
    suggestedParams,
  });

  const txn4 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    to: testAccounts[0].addr,
    amount: 100004,
    note: new Uint8Array(Buffer.from("txn 4")),
    suggestedParams,
  });

  const group1 = [
    { txn: txn1, signers: [] },
    { txn: txn2 },
  ];
  algosdk.assignGroupID(group1.map(toSign => toSign.txn));

  const group2 = [{ txn: txn3, signers: [] }];

  const group3 = [{ txn: txn4 }];

  return [group1, group2, group3];
};

export const scenarios: Array<{ name: string; scenario: Scenario }> = [
  {
    name: "1. Sign single pay txn",
    scenario: singlePayTxn,
  },
  {
    name: "2. Sign single pay txn with close",
    scenario: singlePayTxnWithClose,
  },
  {
    name: "3. Sign single pay txn with rekey",
    scenario: singlePayTxnWithRekey,
  },
  {
    name: "4. Sign single pay txn with rekey and close",
    scenario: singlePayTxnWithRekeyAndClose,
  },
  {
    name: "5. Single pay txn with invalid auth address",
    scenario: singlePayTxnWithInvalidAuthAddress,
  },
  {
    name: "6. Sign single asset opt-in txn",
    scenario: singleAssetOptInTxn,
  },
  {
    name: "7. Sign single asset opt-in txn with invalid asset id",
    scenario: singleAssetOptInTxnToInvalidAsset,
  },
  {
    name: "8. Sign single asset transfer txn",
    scenario: singleAssetTransferTxn,
  },
  {
    name: "9. Sign single asset transfer txn with close",
    scenario: singleAssetTransferTxnWithClose,
  },
  {
    name: "10. Sign single asset transfer txn with invalid asset id",
    scenario: singleInvalidAssetTransferTxn,
  },
  {
    name: "11. Sign single app opt-in txn",
    scenario: singleAppOptIn,
  },
  {
    name: "12. Sign single app call txn",
    scenario: singleAppCall,
  },
  {
    name: "13. Sign single app call txn with rekey",
    scenario: singleAppCallWithRekey,
  },
  {
    name: "14. Sign single app close out txn",
    scenario: singleAppCloseOut,
  },
  {
    name: "15. Sign 1 of 2 txns from a group",
    scenario: sign1FromGroupTxn,
  },
  {
    name: "16. Sign 2 of 3 txns from a group",
    scenario: sign2FromGroupTxn,
  },
  {
    name: "17. Sign txn group with pay, asset opt-in, and asset transfer",
    scenario: signGroupWithPayOptinTransfer,
  },
  {
    name: "18. Sign txn group with pay and rekey",
    scenario: signGroupWithPayRekey,
  },
  {
    name: "19. Sign txn group with asset close",
    scenario: signTxnWithAssetClose,
  },
  {
    name: "20. Sign txn group with rekey",
    scenario: signTxnWithRekey,
  },
  {
    name: "21. Sign txn group with rekey and asset close",
    scenario: signTxnWithRekeyAndAssetClose,
  },
  {
    name: "22. Sign group of 7",
    scenario: signGroupOf7,
  },
  {
    name: "23. Full txn group",
    scenario: fullTxnGroup,
  },
  {
    name: "24. Sign multiple non-atomic txns",
    scenario: multipleNonAtomicTxns,
  },
  {
    name: "25. Sign multiple non-atomic txns for only assets",
    scenario: multipleNonAtomicTxnsForOnlyAssets,
  },
  {
    name: "26. Sign mixed multiple non-atomic txns",
    scenario: multipleNonAtomicTxnsMixed,
  },
  {
    name: "27. Sign atomic txn group and non-atomic txns for only payment",
    scenario: atomicGroupAndNonAtomicTxnsForOnlyPayment,
  },
  {
    name: "28. Sign mixed atomic txn group and non-atomic txns",
    scenario: atomicGroupAndNonAtomicTxnsMixed,
  },
  {
    name: "29. Sign multiple atomic txn groups for only payment",
    scenario: multipleAtomicGroupsForOnlyPayment,
  },
  {
    name: "30. Sign multiple atomic txn groups for only assets",
    scenario: multipleAtomicGroupsForOnlyAssets,
  },
  {
    name: "31. Sign multiple atomic txn groups with invalid asset",
    scenario: multipleAtomicGroupsWithInvalidAsset,
  },
  {
    name: "32. Sign first mixed 2 atomic txn groups",
    scenario: multipleAtomicGroupsMixed1,
  },
  {
    name: "33. Sign second mixed 2 atomic txn groups",
    scenario: multipleAtomicGroupsMixed2,
  },
  {
    name: "34. Sign only 2 txns in multiple atomic txn groups",
    scenario: multipleAtomicGroupSignOnly2,
  },
  {
    name: "35. Sign only 2 txns in atomic txn group and non-atomic txns",
    scenario: atomicGroupAndNonAtomicTxnsSignOnly2,
  }
];
