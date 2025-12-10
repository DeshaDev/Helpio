import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ConnectButton } from 'thirdweb/react';
import { inAppWallet } from 'thirdweb/wallets';
import { client } from '../config/thirdweb';

export function Header() {
  const { t } = useLanguage();
  
  const wallets = [
    inAppWallet({
      auth: {
        options: ['email', 'google', 'apple', 'facebook'],
      },
    }),
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <MessageCircle className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {t.header.title}
              </h1>
              <p className="text-xs text-gray-500">{t.header.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ConnectButton
              client={client}
              wallets={wallets}
              connectButton={{
                label: t.header.connectWallet,
                style: {
                  background: 'linear-gradient(to right, rgb(16, 185, 129), rgb(20, 184, 166))',
                  color: 'white',
                  fontWeight: '500',
                  borderRadius: '0.5rem',
                  padding: '0.625rem 1.5rem',
                },
              }}
              connectModal={{
                size: 'compact',
                title: 'Sign In',
                showThirdwebBranding: false,
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
