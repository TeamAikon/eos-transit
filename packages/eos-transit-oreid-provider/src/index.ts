import OreIdJS from '@apimarket/oreid-js';
import { NetworkConfig, WalletAuth, WalletProvider } from 'eos-transit';

const { OreId } = OreIdJS;

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

    async function connect(): Promise<any> {
      // INFO: Scatter is using this for app detection
      try {
        let { account, state, errors } = oreId.handleAuthResponse(window.location.href);
        console.log("oreidWalletProvider:", account, errors);
        if (account && !errors) {
          console.log("oreidWalletProvider::getUser", account);
          let userInfo = await oreId.getUser(account);
          console.log("userInfo:", userInfo);
          return userInfo;
        }
        return {};
      } catch (error) {
        console.log('[oreid]', error);
        return Promise.reject(error);
      }
    }

    function disconnect(): Promise<any> {
      return Promise.resolve(true);
    }

    // Authentication

    async function login(loginType?: string): Promise<WalletAuth> {
      try {
        const { authCallback, backgroundColor } = config;
        const authUrl = await oreId.getOreIdAuthUrl({ loginType, callbackUrl: authCallback, backgroundColor });
        //console.log("authUrl:", authUrl);
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
