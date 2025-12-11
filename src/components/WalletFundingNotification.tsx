import { Loader2, AlertCircle } from 'lucide-react';
import { useWalletFunding } from '../hooks/useWalletFunding';
import { useLanguage } from '../contexts/LanguageContext';

export function WalletFundingNotification() {
  const { isChecking, isFunding, error } = useWalletFunding();
  const { language } = useLanguage();

  if (!isChecking && !isFunding && !error) {
    return null;
  }

  if (isChecking) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm z-50 animate-slide-up">
        <div className="flex items-start gap-3">
          <Loader2 className="text-blue-500 animate-spin flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="font-medium text-gray-900">
              {language === 'en' ? 'Checking wallet...' : 'جارٍ فحص المحفظة...'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {language === 'en'
                ? 'Please wait while we verify your wallet'
                : 'يرجى الانتظار بينما نتحقق من محفظتك'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isFunding) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-emerald-200 p-4 max-w-sm z-50 animate-slide-up">
        <div className="flex items-start gap-3">
          <Loader2 className="text-emerald-500 animate-spin flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="font-medium text-gray-900">
              {language === 'en' ? 'Funding your wallet...' : 'جارٍ تمويل محفظتك...'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {language === 'en'
                ? 'Sending 0.20 CELO to get you started!'
                : 'إرسال 0.20 CELO للبدء!'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-red-200 p-4 max-w-sm z-50 animate-slide-up">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="font-medium text-gray-900">
              {language === 'en' ? 'Funding Failed' : 'فشل التمويل'}
            </p>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
