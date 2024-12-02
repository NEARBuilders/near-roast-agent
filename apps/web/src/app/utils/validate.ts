import { getAccountState, getMainnetRpcProvider } from "@near-js/client";

export async function isValidNearAccount(accountId: string) {
  try {
    await getAccountState({
      account: accountId,
      deps: { rpcProvider: getMainnetRpcProvider() },
    });
    return true;
  } catch (e) {
    return false;
  }
}
