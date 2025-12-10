import { useState, useEffect } from 'react';
import { MessageSquare, Award, Clock, Tag } from 'lucide-react';
import { Question, Answer, supabase } from '../lib/supabase';
import { AnswerSection } from './AnswerSection';

interface Category {
  name: string;
  color: string;
}

interface QuestionCardProps {
  question: Question;
  onUpdate: () => void;
}

export function QuestionCard({ question, onUpdate }: QuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [answerCount, setAnswerCount] = useState(0);
  const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);

  useEffect(() => {
    fetchAnswers();
    fetchCategoryInfo();
  }, [question.id]);

  const fetchCategoryInfo = async () => {
    if (question.category) {
      const { data } = await supabase
        .from('categories')
        .select('name, color')
        .eq('slug', question.category)
        .maybeSingle();

      if (data) {
        setCategoryInfo(data);
      }
    }
  };

  const fetchAnswers = async () => {
    const { data, error } = await supabase
      .from('answers')
      .select('*, users(*)')
      .eq('question_id', question.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAnswers(data);
      setAnswerCount(data.length);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 hover:border-emerald-200">
      <div
        className="p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {categoryInfo && (
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1"
                  style={{ backgroundColor: categoryInfo.color }}
                >
                  <Tag size={12} />
                  {categoryInfo.name}
                </span>
              )}
              {question.best_answer_id && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 flex items-center gap-1">
                  <Award size={12} />
                  Solved
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight hover:text-emerald-600 transition-colors">
              {question.title}
            </h3>
            <p className="text-gray-600 line-clamp-2 mb-4 leading-relaxed">
              {question.content}
            </p>

            <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
                  {question.wallet_address.slice(2, 4).toUpperCase()}
                </div>
                <span className="font-medium">
                  {question.wallet_address.slice(0, 6)}...{question.wallet_address.slice(-4)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{formatTimeAgo(question.created_at)}</span>
              </div>

              <div className="flex items-center gap-1 font-medium">
                <MessageSquare size={16} />
                <span>{answerCount} {answerCount === 1 ? 'answer' : 'answers'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <AnswerSection
          question={question}
          answers={answers}
          onUpdate={() => {
            fetchAnswers();
            onUpdate();
          }}
        />
      )}
    </div>
  );
}
