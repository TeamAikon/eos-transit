import OreIdJS from '@apimarket/oreid-js';
import OreJS from '@open-rights-exchange/orejs';
import ScatterEOS from 'scatterjs-plugin-eosjs2';
import { NetworkConfig, WalletAuth, WalletProvider } from 'eos-transit';

const { OreId } = OreIdJS;
const { OreJs } = OreIdJS;
const scatterEos = new ScatterEOS();

export function makeSignatureProvider(network: NetworkConfig) {
    return {
        requiredFields:{},
        getAvailableKeys:async () => {
          return []
        },
        sign:async (signargs: any) => {
            //const { account, transaction, signCallbackUrl, chain, state, broadcast } = signargs;
            //let signUrl = await oreId.getOreIdSignUrl({ account, transaction, signCallbackUrl, chain, state, broadcast });
            //console.log("signUrl:", signUrl);
            // window.location = signUrl;
            return []
        }
    }
}

export function oreidWalletProvider(config: any) {
  return function makeWalletProvider(network: NetworkConfig): WalletProvider {
    // Connection
    const { apiKey, oreIdUrl } = config;
    const oreId = new OreId({ apiKey, oreIdUrl });

    function connect(appName: string): Promise<any> {
      // INFO: Scatter is using this for app detection
      return Promise.resolve(true);
    }

    function disconnect(): Promise<any> {
      return Promise.resolve(true);
    }

    // Authentication

    async function login(loginType?: string): Promise<WalletAuth> {
      try {
        const { authCallback, backgroundColor } = config;
        const authUrl = await oreId.getOreIdAuthUrl({ loginType, callbackUrl: authCallback, backgroundColor });
        console.log("authUrl:", authUrl);
        //window.location = authUrl;
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
        description: 'OreID web application that keeps your private keys secure',
      },
      signatureProvider: makeSignatureProvider(network),
      connect,
      disconnect,
      login,
      logout
    };

    return walletProvider;
  };
}

export default oreidWalletProvider;
