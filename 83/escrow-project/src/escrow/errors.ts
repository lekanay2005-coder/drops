
export class EscrowNotFoundError extends Error {
  constructor(accountId: string) {
    super(`Escrow account not found: ${accountId}`);
    this.name = "EscrowNotFoundError";
  }
}
