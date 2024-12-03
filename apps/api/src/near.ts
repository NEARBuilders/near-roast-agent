import { providers, connect, keyStores, KeyPair } from 'near-api-js';
import { Account, ConnectConfig, Near } from 'near-api-js';
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
      nodeUrl: 'https://rpc.testnet.near.org',
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
  };
}
