import { getContract, prepareContractCall, sendTransaction } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';
import { client } from './thirdweb';
import type { Account } from 'thirdweb/wallets';

// Define the chain you're using (Celo mainnet)
export const chain = defineChain(42220);
export const CONTRACT_ADDRESS = '0xcbe68ce46223ffe47638fae33bcdfcdb8bc5c39b';

export const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "author", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "answerId", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "questionId", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "AnswerSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "questionAuthor", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "answerAuthor", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "answerId", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "questionId", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "BestAnswerSelected",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "author", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "questionId", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "category", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "QuestionAsked",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "questionId", "type": "string"},
      {"internalType": "string", "name": "category", "type": "string"}
    ],
    "name": "askQuestion",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "answerId", "type": "string"},
      {"internalType": "string", "name": "questionId", "type": "string"}
    ],
    "name": "submitAnswer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "answerId", "type": "string"},
      {"internalType": "string", "name": "questionId", "type": "string"}
    ],
    "name": "selectBestAnswer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserPoints",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserStats",
    "outputs": [
      {"internalType": "uint256", "name": "totalPoints", "type": "uint256"},
      {"internalType": "uint256", "name": "questionsAsked", "type": "uint256"},
      {"internalType": "uint256", "name": "answersGiven", "type": "uint256"},
      {"internalType": "uint256", "name": "bestAnswers", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "questionId", "type": "string"}],
    "name": "getQuestion",
    "outputs": [
      {"internalType": "address", "name": "author", "type": "address"},
      {"internalType": "string", "name": "category", "type": "string"},
      {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
      {"internalType": "bool", "name": "exists", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "answerId", "type": "string"}],
    "name": "getAnswer",
    "outputs": [
      {"internalType": "address", "name": "author", "type": "address"},
      {"internalType": "string", "name": "questionId", "type": "string"},
      {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
      {"internalType": "bool", "name": "isBestAnswer", "type": "bool"},
      {"internalType": "bool", "name": "exists", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ASK_QUESTION_POINTS",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ANSWER_QUESTION_POINTS",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "BEST_ANSWER_POINTS",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
