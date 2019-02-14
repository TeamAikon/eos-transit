import OreIdJS from '@apimarket/oreid-js';
import { NetworkConfig, WalletAuth, WalletProvider } from 'eos-transit';

const { OreId } = OreIdJS;

export function makeSignatureProvider(network: NetworkConfig, oreId: any) {
    return {
        requiredFields:{},
        getAvailableKeys:async () => {
          return []
        },
        sign:async (signargs: any) => {
            const { account, transaction, signCallbackUrl, chain, state, broadcast } = signargs;
            let signUrl = await oreId.getOreIdSignUrl({ account, transaction, signCallbackUrl, chain, state, broadcast });
            console.log("signUrl:", signUrl);
            window.location = signUrl;
            return []
        }
    }
}

export function oreidWalletProvider(config: any) {
  return function makeWalletProvider(network: NetworkConfig): WalletProvider {
    // Connection
    const { appId, apiKey, oreIdUrl } = config;
    const oreId = new OreId({ appId, apiKey, oreIdUrl });

    // INFO: Sends the user to OreID, and returns them with their accountName
    async function loginUser() {
      const { authCallback, backgroundColor, loginType } = config;
      let oreIdAuthUrl = await oreId.getOreIdAuthUrl({ loginType, callbackUrl:authCallback, backgroundColor });
      window.location = oreIdAuthUrl;
    }

    // INFO: Attempts to find the accountName, and if successfull, calls login to retrieve account info from the chain
    async function connect(): Promise<any> {
      Promise.resolve(true);
    }

    function disconnect(): Promise<any> {
      return Promise.resolve(true);
    }

    // Authentication

    // INFO: Normally uses the accountName to lookup accountInfo from the chain
    // However, if no accountName is specified, the the user is redirected to OreID
    async function login(accountName?: string): Promise<WalletAuth> {
      try {
        if (accountName) {
          const account = await oreId.getUserInfoFromApi(accountName);
          return { accountName: account.accountName, permission: '', publicKey: '' };
        }

        // If no accountName is specified, send the user to OreID to login...
        await loginUser();
        return { accountName: '', permission: '', publicKey: '' };
      } catch (error) {
        console.log('[oreid]', error);
        return Promise.reject(error);
      }
    }

    // INFO: Will remove locally stored userInfo
    async function logout(): Promise<any> {
      await oreId.logout(); //clears local user state (stored in local storage or cookie)
      return Promise.resolve(true);
    }

    const walletProvider: WalletProvider = {
      id: 'oreid',
      meta: {
        name: 'OreID Web',
        shortName: 'OreID',
        description: 'OreID web application that keeps your private keys secure',
      },
      signatureProvider: makeSignatureProvider(network, oreId),
      connect,
      disconnect,
      login,
      logout
    };

    return walletProvider;
  };
}

export default oreidWalletProvider;
