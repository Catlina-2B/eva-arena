import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, useWallets } from "@particle-network/connectkit";
import { useQueryClient } from "@tanstack/react-query";

import { authApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import {
  trackUserLogin,
  trackUserLogout,
  identifyUser,
} from "@/services/analytics";

// SIWS message configuration
const SIWS_CONFIG = {
  domain: "eva.arena",
  statement: "Welcome to EVA Arena!",
  uri: "https://eva.arena",
  version: "1",
  chainId: "mainnet",
};

/**
 * Generate a random nonce for replay attack prevention
 */
function generateNonce(length: number = 16): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomValues = new Uint8Array(length);

  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }

  return result;
}

/**
 * Generate SIWS (Sign-In with Solana) standard message
 */
function generateSIWSMessage(address: string): string {
  const nonce = generateNonce();
  const issuedAt = new Date().toISOString();

  return `${SIWS_CONFIG.domain} wants you to sign in with your Solana account:
${address}

${SIWS_CONFIG.statement}

URI: ${SIWS_CONFIG.uri}
Version: ${SIWS_CONFIG.version}
Chain ID: ${SIWS_CONFIG.chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}`;
}

/**
 * Encode message to Base64
 */
function encodeMessageToBase64(message: string): string {
  return btoa(unescape(encodeURIComponent(message)));
}

/**
 * Encode signature to Base64
 * Handles different signature formats from various wallet providers
 */
function encodeSignatureToBase64(
  signature: Uint8Array | Buffer | number[] | { signature: Uint8Array },
): string {
  // Handle wrapped signature object (some wallets return { signature: ... })
  if (signature && typeof signature === "object" && "signature" in signature) {
    signature = signature.signature;
  }

  // Convert to Uint8Array if needed
  let bytes: Uint8Array;

  if (signature instanceof Uint8Array) {
    bytes = signature;
  } else if (Array.isArray(signature)) {
    bytes = new Uint8Array(signature);
  } else if (typeof Buffer !== "undefined" && Buffer.isBuffer(signature)) {
    bytes = new Uint8Array(signature);
  } else {
    // Try to convert object with numeric keys to array
    const arr = Object.values(signature as unknown as Record<string, number>);

    bytes = new Uint8Array(arr);
  }

  // Convert to base64
  let binary = "";

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}

export interface UseWalletAuthOptions {
  /** Auto-login when wallet connects (default: true) */
  autoLogin?: boolean;
  /** Callback when login succeeds */
  onLoginSuccess?: () => void;
  /** Callback when login fails */
  onLoginError?: (error: Error) => void;
}

export interface UseWalletAuthReturn {
  /** Whether login is in progress */
  isLoggingIn: boolean;
  /** Login error message */
  loginError: string | null;
  /** Manually trigger login */
  login: () => Promise<void>;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
}

/**
 * Hook for wallet signature login with SIWS
 */
export function useWalletAuth(
  options: UseWalletAuthOptions = {},
): UseWalletAuthReturn {
  const { autoLogin = true, onLoginSuccess, onLoginError } = options;

  const { isConnected, address } = useAccount();
  const [primaryWallet] = useWallets();
  const queryClient = useQueryClient();

  const { isAuthenticated, user, login: storeLogin, logout } = useAuthStore();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Track login state to prevent duplicate attempts
  const isLoggingInRef = useRef(false);
  const lastLoginAddressRef = useRef<string | null>(null);
  // Track the previous address for detecting wallet switches
  const prevAddressRef = useRef<string | null>(null);

  /**
   * Perform wallet signature login
   */
  const login = useCallback(async () => {
    // Prevent concurrent login attempts
    if (isLoggingInRef.current) {
      return;
    }

    if (!isConnected || !address || !primaryWallet) {
      setLoginError("Wallet not connected");

      return;
    }

    // Mark as logging in immediately
    isLoggingInRef.current = true;
    lastLoginAddressRef.current = address;
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      // 1. Generate SIWS message
      const message = generateSIWSMessage(address);
      const messageBytes = new TextEncoder().encode(message);

      // 2. Get Solana wallet client and sign message
      const walletClient = primaryWallet.getWalletClient<"solana">();

      if (!walletClient || !walletClient.signMessage) {
        throw new Error("Wallet does not support message signing");
      }

      const signatureResult = await walletClient.signMessage(messageBytes);

      // Debug: log signature format
      console.log(
        "Signature result type:",
        typeof signatureResult,
        signatureResult,
      );

      // 3. Encode message and signature to Base64
      const base64Message = encodeMessageToBase64(message);
      const base64Signature = encodeSignatureToBase64(signatureResult);

      // 4. Call backend login API
      const response = await authApi.login({
        publicKey: address,
        message: base64Message,
        signature: base64Signature,
        chainType: "SOLANA",
      });

      // 5. Store tokens and user info
      storeLogin({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresIn: response.expiresIn,
        tokenType: response.tokenType,
        user: {
          id: response.user.id,
          publicKey: response.user.publicKey,
          turnkeyAddress: response.user.turnkeyAddress,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      // 6. 埋点：用户登录成功
      identifyUser(response.user.id, {
        wallet_address: address,
        login_method: "wallet",
      });
      trackUserLogin({
        login_method: "wallet",
        wallet_address: address,
      });

      onLoginSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";

      setLoginError(errorMessage);
      onLoginError?.(error instanceof Error ? error : new Error(errorMessage));
      console.error("Wallet login failed:", error);
    } finally {
      setIsLoggingIn(false);
      isLoggingInRef.current = false;
    }
  }, [
    isConnected,
    address,
    primaryWallet,
    storeLogin,
    onLoginSuccess,
    onLoginError,
  ]);

  // Auto-login when wallet connects (only once per address)
  useEffect(() => {
    if (!autoLogin) return;
    if (!isConnected || !address) return;

    // Don't auto-login if already logging in
    if (isLoggingInRef.current) return;

    // Don't auto-login if already authenticated with same address
    if (isAuthenticated && user?.publicKey === address) return;

    // Don't auto-login if we already tried this address
    if (lastLoginAddressRef.current === address) return;

    // Trigger login
    login();
  }, [
    autoLogin,
    isConnected,
    address,
    isAuthenticated,
    user?.publicKey,
    login,
  ]);

  // Logout when wallet disconnects
  useEffect(() => {
    if (!isConnected && isAuthenticated) {
      // 埋点：用户登出（钱包断开连接）
      trackUserLogout({ logout_reason: "wallet_disconnect" });
      logout();
      lastLoginAddressRef.current = null;
    }
  }, [isConnected, isAuthenticated, logout]);

  // Handle wallet address change (wallet switch)
  useEffect(() => {
    // Skip if no address or if this is the first mount
    if (!address) {
      prevAddressRef.current = null;
      return;
    }

    // If this is the first address we're seeing, just record it
    if (prevAddressRef.current === null) {
      prevAddressRef.current = address;
      return;
    }

    // Check if address actually changed (wallet switch)
    if (prevAddressRef.current !== address) {
      console.log(
        "Wallet switched from",
        prevAddressRef.current,
        "to",
        address,
      );

      // 埋点：用户登出（钱包切换）
      trackUserLogout({ logout_reason: "wallet_disconnect" });

      // Clear old auth state and cache before new login
      logout();
      queryClient.clear();

      // Reset login tracking to allow new login attempt
      lastLoginAddressRef.current = null;
      isLoggingInRef.current = false;

      // Update previous address
      prevAddressRef.current = address;
    }
  }, [address, logout, queryClient]);

  return {
    isLoggingIn,
    loginError,
    login,
    isAuthenticated,
  };
}

export default useWalletAuth;
