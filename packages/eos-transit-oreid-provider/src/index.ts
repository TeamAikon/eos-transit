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
    const { appId, apiKey, oreIdUrl } = config;
    const oreId = new OreId({ appId, apiKey, oreIdUrl });

    // INFO: Looks for the userInfo in cookie/local storage
    async function fetchAccountNameLocally() {
      console.log("Fetching userInfo locally...");
      let { accountName } = await oreId.getUser();
      console.log("Fetched userInfo locally:", accountName);
      return accountName;
    }

    // INFO: Fetches userInfo from a remote, if the current URL matches the callback
    async function fetchAccountNameRemotely() {
      const url = window.location.href;
      const isCallbackRegex = new RegExp(`${config.authCallback}`);
      if (isCallbackRegex.test(url)) {
        console.log("Fetching userInfo remotely...");
        const { account, errors } = await oreId.handleAuthResponse(url);
        console.log("Fetched userInfo remotely:", account);
        if (errors) {
          //throw new Error(errors.toString()); // TODO: Check and refactor
          console.log("Failed to fetch remotely:", errors);
        }
        return account;
      }
      return null;
    }

    // INFO: Retrieves userInfo remotely, if applicable, otherwise checks locally
    async function fetchAccountName() {
      let accountName = await fetchAccountNameRemotely();
      if (!accountName) {
        accountName = await fetchAccountNameLocally();
      }
      return accountName;
    }

    // INFO: Attempts to find the accountName, and if successfull, calls login to retrieve account info from the chain
    async function connect(): Promise<any> {
      let accountName = await fetchAccountName();

      console.log("connect::accountName", accountName);
      if (accountName) {
        await login(accountName);
      }

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
        if (!accountName) {
          const { authCallback, backgroundColor, loginType } = config;
          let oreIdAuthUrl = await oreId.getOreIdAuthUrl({ loginType, callbackUrl:authCallback, backgroundColor });
          window.location = oreIdAuthUrl;
        }

        return { accountName: accountName || '', permission: '', publicKey: '' };
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
