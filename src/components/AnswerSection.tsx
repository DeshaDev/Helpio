import { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { MessageSquarePlus, Loader2 } from 'lucide-react';
import { useAskQuestion } from '../hooks/useContract';
import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface AskQuestionProps {
  onSuccess: () => void;
}

export function AskQuestion({ onSuccess }: AskQuestionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [categories, setCategories] = useState<Category[]>([]);
  const [pendingQuestionData, setPendingQuestionData] = useState<{
    questionId: string;
    title: string;
    content: string;
    category: string;
  } | null>(null);
  const account = useActiveAccount();
  const address = account?.address;
  const { askQuestion, isPending, isSuccess, receipt } = useAskQuestion();

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    console.log('AskQuestion useEffect:', {
      isSuccess,
      isPending,
      receipt,
      hasPendingData: !!pendingQuestionData,
      address
    });

    if (isSuccess && receipt && pendingQuestionData && address) {
      console.log('✅ Transaction confirmed! Saving to database...');
      saveToDatabase();
    }
  }, [isSuccess, receipt, pendingQuestionData, address]);

  const saveToDatabase = async () => {
    if (!pendingQuestionData || !address || !receipt) {
      console.log('Missing data for save:', { pendingQuestionData, address, receipt });
      return;
    }

    console.log('Saving question to database...');
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

      await supabase.from('questions').insert({
        id: pendingQuestionData.questionId,
        user_id: userId,
        wallet_address: address,
        title: pendingQuestionData.title,
        content: pendingQuestionData.content,
        category: pendingQuestionData.category,
        tx_hash: receipt.transactionHash,
      });

      console.log('Question saved successfully!');
      setTitle('');
      setContent('');
      setCategory('general');
      setPendingQuestionData(null);
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error saving to database:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (!error && data) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !title || !content || !category) return;

    const questionId = crypto.randomUUID();

    console.log('Submitting question:', { questionId, category, title });

    setPendingQuestionData({
      questionId,
      title,
      content,
      category,
    });

    askQuestion(questionId, category);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2 font-medium hover:scale-105"
      >
        <MessageSquarePlus size={24} />
        Ask Question
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Ask a Question</h2>
            <button
              onClick={() => {
                if (!isPending) {
                  setIsOpen(false);
                  setPendingQuestionData(null);
                }
              }}
              disabled={isPending}
              className="text-gray-400 hover:text-gray-600 text-2xl font-light disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Question Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What would you like to know?"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Details
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Provide more context and details..."
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                required
              />
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-sm text-emerald-800">
                <span className="font-semibold">+5 points</span> will be awarded for asking this question
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!isPending) {
                    setIsOpen(false);
                    setPendingQuestionData(null);
                  }
                }}
                disabled={isPending}
                className="flex-1 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 className="animate-spin" size={20} />}
                {isPending ? 'Confirming...' : 'Post Question'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
