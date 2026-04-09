
import { getEscrowBalance } from "../escrow.service";
import { EscrowNotFoundError } from "../errors";

jest.mock("stellar-sdk", () => {
  return {
    ...jest.requireActual("stellar-sdk"),
    Server: jest.fn(),
    isValidPublicKey: jest.fn(),
  };
});

const { Server, isValidPublicKey } = require("stellar-sdk");

describe("getEscrowBalance", () => {
  let loadAccountMock: jest.Mock;

  beforeEach(() => {
    loadAccountMock = jest.fn();

    Server.mockImplementation(() => ({
      loadAccount: loadAccountMock,
    }));

    isValidPublicKey.mockReturnValue(true);
  });

  it("should return balance for funded account", async () => {
    loadAccountMock.mockResolvedValue({
      balances: [{ asset_type: "native", balance: "150.75" }],
      last_modified_ledger: 999,
    });

    const result = await getEscrowBalance("GTEST");

    expect(result).toEqual({
      accountId: "GTEST",
      balance: "150.75",
      lastModifiedLedger: 999,
    });
  });

  it("should return zero if no native balance", async () => {
    loadAccountMock.mockResolvedValue({
      balances: [],
      last_modified_ledger: 999,
    });

    const result = await getEscrowBalance("GTEST");

    expect(result.balance).toBe("0");
  });

  it("should throw EscrowNotFoundError on 404", async () => {
    loadAccountMock.mockRejectedValue({
      response: { status: 404 },
    });

    await expect(getEscrowBalance("GTEST")).rejects.toThrow(
      EscrowNotFoundError
    );
  });

  it("should throw on invalid public key", async () => {
    isValidPublicKey.mockReturnValue(false);

    await expect(getEscrowBalance("BAD_KEY")).rejects.toThrow(
      "Invalid Stellar public key"
    );
  });
});
