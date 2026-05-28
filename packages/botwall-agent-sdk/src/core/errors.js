/**
 * Typed errors thrown by botwall-agent-sdk.
 *
 * Agent operators should generally catch `BotwallError` and inspect `code`
 * to decide whether to retry, surface to the user, or fail the task.
 */

export class BotwallError extends Error {
  constructor(code, message, details) {
    super(message);
    this.name = "BotwallError";
    this.code = code;
    this.details = details || {};
  }
}

export class PaymentRefusedError extends BotwallError {
  constructor(message, details) {
    super("PAYMENT_REFUSED", message, details);
    this.name = "PaymentRefusedError";
  }
}

export class PaymentBudgetExceededError extends BotwallError {
  constructor(message, details) {
    super("BUDGET_EXCEEDED", message, details);
    this.name = "PaymentBudgetExceededError";
  }
}

export class UnsupportedChallengeError extends BotwallError {
  constructor(message, details) {
    super("UNSUPPORTED_CHALLENGE", message, details);
    this.name = "UnsupportedChallengeError";
  }
}

export class OnChainError extends BotwallError {
  constructor(message, details) {
    super("ON_CHAIN_ERROR", message, details);
    this.name = "OnChainError";
  }
}

export class VerificationRejectedError extends BotwallError {
  constructor(message, details) {
    super("VERIFICATION_REJECTED", message, details);
    this.name = "VerificationRejectedError";
  }
}
