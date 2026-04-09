
import { Server, isValidPublicKey } from "stellar-sdk";
import { BalanceInfo } from "./types";
import { EscrowNotFoundError } from "./errors";

const horizon = new Server("https://horizon.stellar.org");

export async function getEscrowBalance(
  accountId: string
): Promise<BalanceInfo> {
  if (!isValidPublicKey(accountId)) {
    throw new Error("Invalid Stellar public key");
  }

  try {
    const account = await horizon.loadAccount(accountId);

    const nativeBalance = account.balances.find(
      (b: any) => b.asset_type === "native"
    );

    const balance = nativeBalance ? nativeBalance.balance : "0";

    return {
      accountId,
      balance,
      lastModifiedLedger: account.last_modified_ledger,
    };
  } catch (err: any) {
    if (err?.response?.status === 404) {
      throw new EscrowNotFoundError(accountId);
    }
    throw err;
  }
}
