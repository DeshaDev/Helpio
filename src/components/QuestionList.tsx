import { useState, useEffect } from 'react';
import { supabase, Question } from '../lib/supabase';
import { QuestionCard } from './QuestionCard';
import { Loader2 } from 'lucide-react';

interface QuestionListProps {
  selectedCategory: string;
}

export function QuestionList({ selectedCategory }: QuestionListProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, [selectedCategory]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('questions')
        .select('*, users(*)')
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (!error && data) {
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <p className="text-gray-500 text-lg">
          {selectedCategory === 'all'
            ? 'No questions yet. Be the first to ask!'
            : `No questions in this category yet. Be the first!`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <QuestionCard key={question.id} question={question} onUpdate={fetchQuestions} />
      ))}
    </div>
  );
}
