import { connect, keyStores } from 'near-api-js';

const config = {
  networkId: 'mainnet',
  keyStore: new keyStores.InMemoryKeyStore(),
  nodeUrl: 'https://rpc.mainnet.near.org',
  contractName: process.env.CONTRACT_NAME!,
  walletUrl: 'https://wallet.mainnet.near.org',
  helperUrl: 'https://helper.mainnet.near.org',
};

const near = await connect(config);
export { near };
