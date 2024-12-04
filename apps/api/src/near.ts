import { getProviderByEndpoints } from '@near-js/client';
import { Account, connect, ConnectConfig, KeyPair, keyStores, Near, providers } from 'near-api-js';
import { FunctionCallOptions } from 'near-api-js/lib/account';
import { FinalExecutionOutcome } from 'near-api-js/lib/providers';
import { KeyPairString } from 'near-api-js/lib/utils/key_pair';

const MAX_GAS = BigInt('300000000000000');
const NO_DEPOSIT = BigInt('0');

interface WalletOptions {
  networkId?: string;
  accountId: string;
  privateKey: KeyPairString;
}

interface ViewMethodOptions {
  contractId: string;
  method: string;
  args?: Record<string, unknown>;
}

interface CallMethodOptions extends ViewMethodOptions {
  gas?: bigint;
  deposit?: bigint;
}

export class Wallet {
  private accountId: string;
  private networkId: string;
  private near: Promise<Near>;

  constructor({ networkId = 'testnet', accountId, privateKey }: WalletOptions) {
    this.accountId = accountId;
    this.networkId = networkId;

    const keyPair = KeyPair.fromString(privateKey);
    const keyStore = new keyStores.InMemoryKeyStore();
    keyStore.setKey(networkId, accountId, keyPair);

    const config: ConnectConfig = {
      networkId,
      nodeUrl: RPC_ENDPOINTS[networkId as "mainnet" | "testnet"][0],
      keyStore,
    };

    this.near = connect(config);
  }

  viewMethod = async ({ contractId, method, args = {} }: ViewMethodOptions): Promise<unknown> => {
    const account: Account = await (await this.near).account(this.accountId);
    return await account.viewFunction({
      contractId,
      methodName: method,
      args,
    });
  };

  callMethod = async ({
    contractId,
    method,
    args = {},
    gas = MAX_GAS,
    deposit = NO_DEPOSIT,
  }: CallMethodOptions): Promise<unknown> => {
    const account: Account = await (await this.near).account(this.accountId);

    const options: FunctionCallOptions = {
      contractId,
      methodName: method,
      args,
      gas,
      attachedDeposit: deposit,
    };

    const outcome: FinalExecutionOutcome = await account.functionCall(options);
    return providers.getTransactionLastResult(outcome);

    // BELOW GAVE ISSUE WITH @NEAR-JS/CLIENT

    // const signer = getSignerFromPrivateKey(SIGNER_PRIVATE_KEY as KeyPairString);

    // const composer = TransactionComposer.init({
    //   sender: SIGNER_ID,
    //   receiver: CONTRACT_ID,
    // });

    // const transaction = composer.functionCall("respond", {
    //   yield_id: yieldId,
    //   response,
    // }).toTransaction();

    // console.log("have transaction, time to sign and send", transaction);

    // return signAndSendTransaction({ transaction, deps: { signer, rpcProvider } });
  };
}


// Default to testnet if not specified
const NETWORK_ID = (process.env.NETWORK_ID || 'testnet') as 'testnet' | 'mainnet';
const SIGNER_ID = process.env.SIGNER_ID;
const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;

const RPC_ENDPOINTS = { // TODO: these are not used in callMethod
  mainnet: [
    "https://g.w.lavanet.xyz:443/gateway/near/rpc-http/e330a793cbe84ecb08940afd9ebb957c",
    "https://rpc.shitzuapes.xyz"
  ],
  testnet: [
    "https://g.w.lavanet.xyz:443/gateway/neart/rpc-http/e330a793cbe84ecb08940afd9ebb957c"
  ]
}

// Validate network ID and get RPC provider
if (!RPC_ENDPOINTS[NETWORK_ID]) {
  throw new Error(`Invalid NETWORK_ID: ${NETWORK_ID}. Must be either 'testnet' or 'mainnet'`);
}

// Validate required environment variables for transaction signing
if (!SIGNER_ID) {
  throw new Error('SIGNER_ID environment variable is required for sending transactions');
}
if (!SIGNER_PRIVATE_KEY) {
  throw new Error('SIGNER_PRIVATE_KEY environment variable is required for sending transactions');
}

export const wallet = new Wallet({ networkId: NETWORK_ID, accountId: SIGNER_ID, privateKey: SIGNER_PRIVATE_KEY as KeyPairString });

export const rpcProvider = getProviderByEndpoints(...RPC_ENDPOINTS[NETWORK_ID]);
