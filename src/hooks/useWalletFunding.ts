import { useEffect, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { supabase } from '../lib/supabase';

interface FundingStatus {
  isChecking: boolean;
  isFunded: boolean;
  isFunding: boolean;
  error: string | null;
  transactionHash?: string;
}

export function useWalletFunding() {
  const account = useActiveAccount();
  const [status, setStatus] = useState<FundingStatus>({
    isChecking: false,
    isFunded: false,
    isFunding: false,
    error: null,
  });

  useEffect(() => {
    if (!account?.address) {
      setStatus({
        isChecking: false,
        isFunded: false,
        isFunding: false,
        error: null,
      });
      return;
    }

    const checkAndFundWallet = async () => {
      const walletAddress = account.address.toLowerCase();

      setStatus(prev => ({ ...prev, isChecking: true, error: null }));

      try {
        const { data: existingFunding } = await supabase
          .from('funded_wallets')
          .select('transaction_hash')
          .eq('wallet_address', walletAddress)
          .maybeSingle();

        if (existingFunding) {
          setStatus({
            isChecking: false,
            isFunded: true,
            isFunding: false,
            error: null,
            transactionHash: existingFunding.transaction_hash,
          });
          return;
        }

        setStatus(prev => ({ ...prev, isFunding: true, isChecking: false }));

        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fund-wallet`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ walletAddress: account.address }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Funding failed');
        }

        setStatus({
          isChecking: false,
          isFunded: true,
          isFunding: false,
          error: null,
          transactionHash: data.transactionHash,
        });

        console.log('✅ Wallet funded successfully:', data.transactionHash);
      } catch (error) {
        console.error('Funding error:', error);
        setStatus({
          isChecking: false,
          isFunded: false,
          isFunding: false,
          error: error instanceof Error ? error.message : 'Failed to fund wallet',
        });
      }
    };

    checkAndFundWallet();
  }, [account?.address]);

  return status;
}
