import React, { useState, useMemo } from 'react';
import { useAppContext } from '../App';
import { languages } from '../translations';
import { Globe, Search, Check, X, Sparkles, MapPin } from 'lucide-react';

interface LanguageTranslatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageTranslatorModal: React.FC<LanguageTranslatorModalProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<'all' | 'popular' | 'asia' | 'americas' | 'europe' | 'mea'>('all');

  const popularCodes = ['en-US', 'zh-CN', 'zh-TW', 'es-ES', 'ja-JP', 'vi-VN', 'fr-FR', 'ar-SA', 'ko-KR', 'de-DE', 'hi-IN', 'pt-BR'];

  const filteredLanguages = useMemo(() => {
    return languages.filter(lang => {
      const matchesSearch = 
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      if (selectedRegion === 'popular') return popularCodes.includes(lang.code);
      if (selectedRegion === 'asia') return ['zh-CN', 'zh-TW', 'ja-JP', 'ko-KR', 'vi-VN', 'th-TH', 'id-ID', 'ms-MY', 'hi-IN', 'fil-PH', 'km-KH', 'my-MM', 'bn-BD', 'ta-IN', 'te-IN', 'kn-IN', 'ml-IN', 'pa-IN', 'gu-IN', 'mr-IN', 'ne-NP', 'si-LK'].includes(lang.code);
      if (selectedRegion === 'europe') return ['en-GB', 'fr-FR', 'de-DE', 'it-IT', 'ru-RU', 'es-ES', 'pt-PT', 'nl-NL', 'sv-SE', 'no-NO', 'da-DK', 'fi-FI', 'pl-PL', 'el-GR', 'uk-UA', 'bg-BG', 'sr-RS', 'sk-SK', 'hr-HR', 'cs-CZ', 'hu-HU', 'ro-RO', 'et-EE', 'lv-LV', 'lt-LT'].includes(lang.code);
      if (selectedRegion === 'americas') return ['en-US', 'es-ES', 'pt-BR', 'fr-FR'].includes(lang.code);
      if (selectedRegion === 'mea') return ['ar-SA', 'tr-TR', 'he-IL', 'sw-KE', 'am-ET', 'af-ZA', 'zu-ZA', 'xh-ZA', 'ps-AF', 'fa-IR', 'ur-PK', 'ha-NG', 'yo-NG', 'ig-NG', 'so-SO'].includes(lang.code);

      return true;
    });
  }, [searchQuery, selectedRegion]);

  if (!isOpen) return null;

  const currentLang = languages.find(l => l.code === state.language) || languages[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="bg-[#0A2540] text-white p-5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Globe className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Cathay Global Translator</h3>
                <span className="text-[9px] font-black uppercase bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                  {languages.length} Languages
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-300">
                Current: <span className="text-amber-300 font-bold">{currentLang.flag} {currentLang.name}</span>
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50 dark:bg-slate-900/50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by country, language name or code..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Region Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px] font-black uppercase">
            {[
              { id: 'all', label: 'All' },
              { id: 'popular', label: 'Popular' },
              { id: 'asia', label: 'Asia-Pacific' },
              { id: 'americas', label: 'Americas' },
              { id: 'europe', label: 'Europe' },
              { id: 'mea', label: 'Middle East & Africa' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedRegion(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                  selectedRegion === tab.id 
                    ? 'bg-[#0066CC] text-white shadow-sm' 
                    : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language Grid */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {filteredLanguages.length > 0 ? (
            filteredLanguages.map(lang => {
              const isSelected = lang.code === state.language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'SET_LANGUAGE', payload: lang.code });
                    onClose();
                  }}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-left transition ${
                    isSelected 
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-[#0066CC] text-[#0066CC] dark:text-blue-400 shadow-sm' 
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl leading-none">{lang.flag}</span>
                    <div>
                      <p className="text-xs font-black leading-tight">{lang.name}</p>
                      <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{lang.code}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#0066CC] text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400 space-y-2">
              <Globe className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs font-bold">No languages found matching "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Instant multi-country auto-translation powered by Cathay Global Engine
          </p>
        </div>
      </div>
    </div>
  );
};

export default LanguageTranslatorModal;
