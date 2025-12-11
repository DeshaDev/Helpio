import { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { Send, Award, Clock, Loader2 } from 'lucide-react';
import { Question, Answer, supabase } from '../lib/supabase';
import { useSubmitAnswer, useSelectBestAnswer } from '../hooks/useContract';

interface AnswerSectionProps {
  question: Question;
  answers: Answer[];
  onUpdate: () => void;
}

export function AnswerSection({ question, answers, onUpdate }: AnswerSectionProps) {
  const [newAnswer, setNewAnswer] = useState('');
  const [pendingAnswerData, setPendingAnswerData] = useState<{ answerId: string; content: string } | null>(null);
  const [pendingBestAnswer, setPendingBestAnswer] = useState<Answer | null>(null);

  const account = useActiveAccount();
  const address = account?.address;

  const { submitAnswer, receipt: answerReceipt, isPending: isAnswerPending, isSuccess: isAnswerSuccess } = useSubmitAnswer();
  const { selectBestAnswer, receipt: bestAnswerReceipt, isPending: isBestPending, isSuccess: isBestSuccess } = useSelectBestAnswer();

  const isQuestionAuthor = address && question.wallet_address === address;

  // --- Save Answer to Supabase after successful transaction ---
  useEffect(() => {
    if (isAnswerSuccess && answerReceipt && pendingAnswerData && address) {
      saveAnswerToDatabase();
    }
  }, [isAnswerSuccess, answerReceipt]);

  const saveAnswerToDatabase = async () => {
    if (!pendingAnswerData || !address || !answerReceipt) return;

    try {
      let userId = null;

      const { data: existingUser } = await supabase
        .from('users')
        .select('id, total_points')
        .eq('wallet_address', address)
        .maybeSingle();

      if (existingUser) {
        userId = existingUser.id;
        await supabase
          .from('users')
          .update({ total_points: existingUser.total_points + 5 })
          .eq('id', userId);
      } else {
        const { data: newUser } = await supabase
          .from('users')
          .insert({ wallet_address: address, total_points: 5 })
          .select('id')
          .single();
        userId = newUser?.id;
      }

      await supabase.from('answers').insert({
        id: pendingAnswerData.answerId,
        question_id: question.id,
        user_id: userId,
        wallet_address: address,
        content: pendingAnswerData.content,
        tx_hash: answerReceipt.transactionHash,
      });

      setNewAnswer('');
      setPendingAnswerData(null);
      onUpdate();
    } catch (error) {
      console.error('Error saving answer to database:', error);
    }
  };

  // --- Save Best Answer to Supabase after successful transaction ---
  useEffect(() => {
    if (isBestSuccess && bestAnswerReceipt && pendingBestAnswer) {
      saveBestAnswerToDatabase();
    }
  }, [isBestSuccess, bestAnswerReceipt]);

  const saveBestAnswerToDatabase = async () => {
    if (!pendingBestAnswer) return;

    try {
      await supabase
        .from('answers')
        .update({ is_best_answer: true })
        .eq('id', pendingBestAnswer.id);

      await supabase
        .from('questions')
        .update({ best_answer_id: pendingBestAnswer.id })
        .eq('id', question.id);

      const { data: answerAuthor } = await supabase
        .from('users')
        .select('total_points')
        .eq('wallet_address', pendingBestAnswer.wallet_address)
        .maybeSingle();

      if (answerAuthor) {
        await supabase
          .from('users')
          .update({ total_points: answerAuthor.total_points + 10 })
          .eq('wallet_address', pendingBestAnswer.wallet_address);
      }

      setPendingBestAnswer(null);
      onUpdate();
    } catch (error) {
      console.error('Error saving best answer to database:', error);
    }
  };

  // --- Handlers ---
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !newAnswer.trim() || isQuestionAuthor) return;

    const answerId = crypto.randomUUID();
    setPendingAnswerData({ answerId, content: newAnswer });
    submitAnswer(answerId, question.id); // user pays gas
  };

  const handleSelectBest = async (answer: Answer) => {
    if (!address || question.wallet_address !== address || question.best_answer_id) return;

    setPendingBestAnswer(answer);
    selectBestAnswer(answer.id, question.id); // user pays gas
  };

  // --- Utility ---
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // --- Render ---
  return (
    <div className="border-t border-gray-100 bg-gray-50">
      <div className="p-6 space-y-4">
        <h4 className="font-semibold text-gray-900 text-lg">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h4>

        {answers.map((answer) => (
          <div
            key={answer.id}
            className={`bg-white rounded-lg p-5 border-2 transition-all ${
              answer.is_best_answer ? 'border-amber-400 shadow-md' : 'border-gray-100'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-gray-800 mb-3 leading-relaxed">{answer.content}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-xs">
                      {answer.wallet_address.slice(2, 4).toUpperCase()}
                    </div>
                    <span className="font-medium">
                      {answer.wallet_address.slice(0, 6)}...{answer.wallet_address.slice(-4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{formatTimeAgo(answer.created_at)}</span>
                  </div>
                  {answer.is_best_answer && (
                    <div className="flex items-center gap-1 text-amber-600 font-semibold">
                      <Award size={16} />
                      <span>Best Answer</span>
                    </div>
                  )}
                </div>
              </div>

              {isQuestionAuthor && !question.best_answer_id && !answer.is_best_answer && (
                <button
                  onClick={() => handleSelectBest(answer)}
                  disabled={isBestPending}
                  className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isBestPending ? <Loader2 className="animate-spin" size={16} /> : <Award size={16} />}
                  Mark Best
                </button>
              )}
            </div>
          </div>
        ))}

        {address ? (
          isQuestionAuthor ? (
            <div className="bg-amber-50 rounded-lg p-4 text-center border border-amber-200">
              <p className="text-amber-800 font-medium">You cannot answer your own question</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitAnswer} className="mt-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <textarea
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Share your answer..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  required
                />

                <div className="flex items-center justify-between mt-3">
                  <p className="text-sm text-emerald-700">
                    <span className="font-semibold">+5 points</span> for answering
                  </p>
                  <button
                    type="submit"
                    disabled={isAnswerPending}
                    className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isAnswerPending && <Loader2 className="animate-spin" size={16} />}
                    <Send size={16} />
                    Submit Answer
                  </button>
                </div>
              </div>
            </form>
          )
        ) : (
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <p className="text-gray-600">Connect your wallet to answer this question</p>
          </div>
        )}
      </div>
    </div>
  );
}
