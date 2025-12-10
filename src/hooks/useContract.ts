import { useState } from "react";
import { useSendTransaction, useReadContract, useActiveAccount } from "thirdweb/react";
import { prepareContractCall, getContract } from "thirdweb";

// Import contract details from lib folder
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../lib/contract";

// Import client from config folder
import { client } from "../config/thirdweb";
import { celo } from "thirdweb/chains";

const contract = getContract({
  client,
  chain: celo,
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
});

// -----------------------------
// Ask Question Hook
// -----------------------------
export function useAskQuestion() {
  const account = useActiveAccount();
  const { mutateAsync: sendTransaction, isPending, data: receipt } = useSendTransaction({ client });
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const askQuestion = async (questionId: string, category: string) => {
    if (!account) {
      setError(new Error('Please connect your wallet'));
      return;
    }

    try {
      setError(null);
      setIsSuccess(false);

      const transaction = prepareContractCall({
        contract,
        method: 'function askQuestion(string questionId, string category)',
        params: [questionId, category],
      });

      await sendTransaction(transaction, { client }); // user pays gas
      setIsSuccess(true);
    } catch (err) {
      setError(err as Error);
      console.error('Transaction error:', err);
    }
  };

  return { askQuestion, isPending, isSuccess, error, receipt };
}

// -----------------------------
// Submit Answer Hook
// -----------------------------
export function useSubmitAnswer() {
  const account = useActiveAccount();
  const { mutateAsync: sendTransaction, isPending, data: receipt } = useSendTransaction({ client });
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const submitAnswer = async (answerId: string, questionId: string) => {
    if (!account) {
      setError(new Error('Please connect your wallet'));
      return;
    }

    try {
      setError(null);
      setIsSuccess(false);

      const transaction = prepareContractCall({
        contract,
        method: 'function submitAnswer(string answerId, string questionId)',
        params: [answerId, questionId],
      });

      await sendTransaction(transaction, { client }); // user pays gas
      setIsSuccess(true);
    } catch (err) {
      setError(err as Error);
      console.error('Transaction error:', err);
    }
  };

  return { submitAnswer, isPending, isSuccess, error, receipt };
}

// -----------------------------
// Select Best Answer Hook
// -----------------------------
export function useSelectBestAnswer() {
  const account = useActiveAccount();
  const { mutateAsync: sendTransaction, isPending, data: receipt } = useSendTransaction({ client });
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const selectBestAnswer = async (answerId: string, questionId: string) => {
    if (!account) {
      setError(new Error('Please connect your wallet'));
      return;
    }

    try {
      setError(null);
      setIsSuccess(false);

      const transaction = prepareContractCall({
        contract,
        method: 'function selectBestAnswer(string answerId, string questionId)',
        params: [answerId, questionId],
      });

      await sendTransaction(transaction, { client }); // user pays gas
      setIsSuccess(true);
    } catch (err) {
      setError(err as Error);
      console.error('Transaction error:', err);
    }
  };

  return { selectBestAnswer, isPending, isSuccess, error, receipt };
}

// -----------------------------
// Read-only Hooks
// -----------------------------
export function useGetUserPoints(address: string | undefined) {
  const { data: points, isLoading, error } = useReadContract({
    contract,
    method: 'function getUserPoints(address user) view returns (uint256)',
    params: address ? [address] : undefined,
    client,
  });

  return { points, isLoading, error };
}

export function useGetUserStats(address: string | undefined) {
  const { data: stats, isLoading, error } = useReadContract({
    contract,
    method: 'function getUserStats(address user) view returns (uint256 totalPoints, uint256 questionsAsked, uint256 answersGiven, uint256 bestAnswers)',
    params: address ? [address] : undefined,
    client,
  });

  return { stats, isLoading, error };
}
