import OreIdJS from '@apimarket/oreid-js';
import OreJS from '@open-rights-exchange/orejs';
import ScatterEOS from 'scatterjs-plugin-eosjs2';
import { WalletProvider, NetworkConfig, WalletAuth } from 'eos-transit';

const { OreId } = OreIdJS;
const { OreJs } = OreIdJS;
const scatterEos = new ScatterEOS();

export function makeSignatureProvider(network: NetworkConfig) {
  return scatterEos.hookProvider(network, null, true);
}

export function oreidWalletProvider(config: Object) {
  return function makeWalletProvider(network: NetworkConfig): WalletProvider {
    // Connection

    function connect(appName: string): Promise<any> {
      // INFO: Scatter is using this for app detection
      // NOTE: So, perhaps we should just return true
      return Promise.resolve(true);
    }

    function disconnect(): Promise<any> {
      return Promise.resolve(true);
    }

    // Authentication

    async function login(accountName?: string): Promise<WalletAuth> {
      try {
        // TODO: Fetch the users account info...
        //let accountInfo = await OreId.fetchAccountInfo();
        return {
          accountName: 'namenamename',
          permission: 'active',
          publicKey: 'EOSpublickey'
        };
      } catch (error) {
        console.log('[oreid]', error);
        return Promise.reject(error);
      }
    }

    function logout(accountName?: string): Promise<any> {
      return Promise.resolve(true);
    }

    const walletProvider: WalletProvider = {
      id: 'oreid',
      meta: {
        name: 'OreID Web',
        shortName: 'OreID',
        description:
          'OreID web application that keeps your private keys secure'
      },
      signatureProvider: makeSignatureProvider(network),
      connect,
      disconnect,
      login,
      logout,
      ...config
    };

    return walletProvider;
  };
}

export default oreidWalletProvider;
