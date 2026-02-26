import { motion, AnimatePresence } from 'framer-motion';
import { Book, Palette, Music, Code, Languages, Calculator, Beaker, Heart, X } from 'lucide-react';

// Study subjects/hobbies with AI coach advice
const SUBJECTS = [
  {
    id: 'math',
    icon: Calculator,
    name_tr: 'Matematik',
    name_en: 'Mathematics',
    color: 'blue',
    advice_tr: 'Matematik için: Problem çözme pratiği yap, formülleri not al, örnek sorular çöz.',
    advice_en: 'For Math: Practice problem-solving, note formulas, solve example questions.'
  },
  {
    id: 'science',
    icon: Beaker,
    name_tr: 'Fen Bilgisi',
    name_en: 'Science',
    color: 'green',
    advice_tr: 'Fen için: Kavramları görselleştir, deneyleri not al, ilişkileri kur.',
    advice_en: 'For Science: Visualize concepts, note experiments, connect relationships.'
  },
  {
    id: 'language',
    icon: Languages,
    name_tr: 'Dil',
    name_en: 'Language',
    color: 'purple',
    advice_tr: 'Dil için: Kelime ezberle, gramer kurallarını gözden geçir, okuma pratiği yap.',
    advice_en: 'For Language: Memorize vocabulary, review grammar rules, practice reading.'
  },
  {
    id: 'literature',
    icon: Book,
    name_tr: 'Edebiyat',
    name_en: 'Literature',
    color: 'amber',
    advice_tr: 'Edebiyat için: Eserleri analiz et, notlar al, yazarlar hakkında araştırma yap.',
    advice_en: 'For Literature: Analyze works, take notes, research about authors.'
  },
  {
    id: 'coding',
    icon: Code,
    name_tr: 'Kodlama',
    name_en: 'Coding',
    color: 'indigo',
    advice_tr: 'Kodlama için: Kod yaz, hata ayıkla, projeler geliştir, dokümantasyon oku.',
    advice_en: 'For Coding: Write code, debug, develop projects, read documentation.'
  },
  {
    id: 'art',
    icon: Palette,
    name_tr: 'Sanat',
    name_en: 'Art',
    color: 'pink',
    advice_tr: 'Sanat için: Gözlem yap, eskiz çiz, farklı teknikler dene, ilham kaynakları bul.',
    advice_en: 'For Art: Observe, sketch, try different techniques, find inspiration.'
  },
  {
    id: 'music',
    icon: Music,
    name_tr: 'Müzik',
    name_en: 'Music',
    color: 'rose',
    advice_tr: 'Müzik için: Düzenli pratik yap, notaları öğren, ritim çalış, dinle ve analiz et.',
    advice_en: 'For Music: Practice regularly, learn notes, work on rhythm, listen and analyze.'
  },
  {
    id: 'other',
    icon: Heart,
    name_tr: 'Diğer',
    name_en: 'Other',
    color: 'gray',
    advice_tr: 'Genel çalışma: Odaklan, molalar ver, notlar al, tekrar et.',
    advice_en: 'General study: Focus, take breaks, take notes, review.'
  }
];

// Color mappings
const COLOR_CLASSES = {
  blue: {
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    hover: 'hover:bg-blue-200',
    text: 'text-blue-700',
    icon: 'text-blue-600'
  },
  green: {
    bg: 'bg-green-100',
    border: 'border-green-300',
    hover: 'hover:bg-green-200',
    text: 'text-green-700',
    icon: 'text-green-600'
  },
  purple: {
    bg: 'bg-purple-100',
    border: 'border-purple-300',
    hover: 'hover:bg-purple-200',
    text: 'text-purple-700',
    icon: 'text-purple-600'
  },
  amber: {
    bg: 'bg-amber-100',
    border: 'border-amber-300',
    hover: 'hover:bg-amber-200',
    text: 'text-amber-700',
    icon: 'text-amber-600'
  },
  indigo: {
    bg: 'bg-indigo-100',
    border: 'border-indigo-300',
    hover: 'hover:bg-indigo-200',
    text: 'text-indigo-700',
    icon: 'text-indigo-600'
  },
  pink: {
    bg: 'bg-pink-100',
    border: 'border-pink-300',
    hover: 'hover:bg-pink-200',
    text: 'text-pink-700',
    icon: 'text-pink-600'
  },
  rose: {
    bg: 'bg-rose-100',
    border: 'border-rose-300',
    hover: 'hover:bg-rose-200',
    text: 'text-rose-700',
    icon: 'text-rose-600'
  },
  gray: {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    hover: 'hover:bg-gray-200',
    text: 'text-gray-700',
    icon: 'text-gray-600'
  }
};

export default function SubjectSelectionModal({
  isOpen = false,
  onClose,
  onSelectSubject,
  language = 'tr',
  selectedSubject = null
}) {
  const handleSelect = (subject) => {
    onSelectSubject(subject);
    // Show AI advice briefly
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-[#F5E6D3] to-[#E8D4BA] rounded-2xl border-4 border-[#D4C4A8] p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#5D4E37]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                {language === 'tr' ? '📚 Ne Çalışıyorsun?' : '📚 What Are You Studying?'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-[#8B6B4D]" />
              </button>
            </div>

            {/* Description */}
            <p className="text-[#8B6B4D] mb-6 text-center">
              {language === 'tr' 
                ? 'Konunu seç, AI coach sana en iyi çalışma tekniklerini önersin! ✨' 
                : 'Select your subject, let AI coach suggest the best study techniques! ✨'}
            </p>

            {/* Subject Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              {SUBJECTS.map((subject) => {
                const Icon = subject.icon;
                const colors = COLOR_CLASSES[subject.color];
                const isSelected = selectedSubject?.id === subject.id;
                
                return (
                  <motion.button
                    key={subject.id}
                    onClick={() => handleSelect(subject)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all
                      ${colors.bg} ${colors.border} ${colors.hover}
                      ${isSelected ? 'ring-4 ring-offset-2 ring-purple-400' : ''}
                    `}
                  >
                    {/* Icon */}
                    <div className={`${colors.icon} mb-2 flex justify-center`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    
                    {/* Name */}
                    <p className={`font-bold text-sm ${colors.text}`}>
                      {language === 'tr' ? subject.name_tr : subject.name_en}
                    </p>

                    {/* Selected indicator */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl"
                      >
                        ✓
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* AI Advice Preview */}
            {selectedSubject && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl border-2 border-purple-200"
              >
                <p className="text-purple-700 font-medium text-sm">
                  <span className="font-bold">💡 AI Coach: </span>
                  {language === 'tr' ? selectedSubject.advice_tr : selectedSubject.advice_en}
                </p>
              </motion.div>
            )}

            {/* Skip button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full mt-4 px-6 py-3 bg-[#A89880] text-white rounded-lg font-bold border-b-4 border-[#8B7B68] hover:bg-[#B8A890] transition-colors"
            >
              {language === 'tr' ? 'Atla' : 'Skip'}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Export subjects for AI coach usage
export { SUBJECTS };
