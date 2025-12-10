import { useState } from 'react';
import { ThirdwebProvider } from 'thirdweb/react';
import { Header } from './components/Header';
import { QuestionList } from './components/QuestionList';
import { Leaderboard } from './components/Leaderboard';
import { AskQuestion } from './components/AskQuestion';
import { CategoryFilter } from './components/CategoryFilter';
import { WalletFundingNotification } from './components/WalletFundingNotification';
import { useActiveAccount } from 'thirdweb/react';
import { LayoutGrid, List } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

function AppContent() {
  const account = useActiveAccount();
  const isConnected = !!account;
  const { t } = useLanguage();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleQuestionSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <WalletFundingNotification />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{t.home.title}</h2>
            <p className="text-gray-600 mt-1">{t.home.subtitle}</p>
          </div>

          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all font-medium text-gray-700"
          >
            {showLeaderboard ? (
              <>
                <List size={20} />
                <span className="hidden sm:inline">{t.home.questions}</span>
              </>
            ) : (
              <>
                <LayoutGrid size={20} />
                <span className="hidden sm:inline">{t.home.leaderboard}</span>
              </>
            )}
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          <div className="lg:col-span-2">
            {showLeaderboard ? <Leaderboard /> : <QuestionList key={refreshKey} selectedCategory={selectedCategory} />}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t.points.title}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <span className="text-gray-700">{t.points.askQuestion}</span>
                  <span className="font-bold text-emerald-600">+5 pts</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                  <span className="text-gray-700">{t.points.submitAnswer}</span>
                  <span className="font-bold text-teal-600">+5 pts</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <span className="text-gray-700">{t.points.bestAnswer}</span>
                  <span className="font-bold text-amber-600">+10 pts</span>
                </div>
              </div>

              {!isConnected && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 text-center">
                    {t.points.connectPrompt}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-sm p-6 text-white lg:block hidden">
              <h3 className="text-lg font-bold mb-2">{t.about.title}</h3>
              <p className="text-emerald-50 text-sm leading-relaxed">
                {t.about.description}
              </p>
            </div>
          </div>
        </div>

        {isConnected && <AskQuestion onSuccess={handleQuestionSuccess} />}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThirdwebProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThirdwebProvider>
  );
}

export default App;
