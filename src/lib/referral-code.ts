const REFERRAL_CODE_KEY = "eva_referral_code";

export function getReferralCode(): string | null {
  return localStorage.getItem(REFERRAL_CODE_KEY);
}

export function setReferralCode(code: string): void {
  localStorage.setItem(REFERRAL_CODE_KEY, code);
}

export function clearReferralCode(): void {
  localStorage.removeItem(REFERRAL_CODE_KEY);
}
