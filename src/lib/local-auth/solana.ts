// Embedded Privy wallets are not available in this deployment.
export function useWallets() {
  return { wallets: [] as any[], ready: true };
}

export function useSignAndSendTransaction() {
  return {
    signAndSendTransaction: async (..._args: any[]): Promise<any> => {
      throw new Error('Wallet withdrawals are not available on this deployment.');
    },
  };
}
