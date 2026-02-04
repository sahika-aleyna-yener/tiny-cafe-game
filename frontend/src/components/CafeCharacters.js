import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Cafe customers/characters with their activities
const CHARACTERS = [
  { id: 1, emoji: '👩‍💻', name: 'Elif', activity_tr: 'Laptop ile çalışıyor', activity_en: 'Working on laptop', position: { x: 15, y: 65 } },
  { id: 2, emoji: '👨‍🎓', name: 'Ahmet', activity_tr: 'Kitap okuyor', activity_en: 'Reading a book', position: { x: 75, y: 70 } },
  { id: 3, emoji: '👩‍🎨', name: 'Zeynep', activity_tr: 'Çizim yapıyor', activity_en: 'Drawing', position: { x: 45, y: 60 } },
  { id: 4, emoji: '🧑‍💼', name: 'Can', activity_tr: 'Kahve içiyor', activity_en: 'Having coffee', position: { x: 85, y: 55 } },
  { id: 5, emoji: '👩‍🏫', name: 'Ayşe', activity_tr: 'Not alıyor', activity_en: 'Taking notes', position: { x: 25, y: 75 } },
  { id: 6, emoji: '🧑‍🔬', name: 'Mert', activity_tr: 'Araştırma yapıyor', activity_en: 'Doing research', position: { x: 60, y: 68 } },
  { id: 7, emoji: '👨‍🎤', name: 'Kerem', activity_tr: 'Kulaklıkla çalışıyor', activity_en: 'Working with headphones', position: { x: 35, y: 72 } },
  { id: 8, emoji: '👩‍⚕️', name: 'Selin', activity_tr: 'Ders çalışıyor', activity_en: 'Studying', position: { x: 55, y: 62 } },
];

// Speech bubbles
const SPEECH_BUBBLES = [
  { tr: 'Harika bir gün! ☀️', en: 'Great day! ☀️' },
  { tr: 'Bu müzik çok güzel 🎵', en: 'This music is nice 🎵' },
  { tr: 'Kahve molası! ☕', en: 'Coffee break! ☕' },
  { tr: 'Çok verimli çalışıyorum 📚', en: 'Very productive study 📚' },
  { tr: 'Sınava hazırlanıyorum 💪', en: 'Preparing for exam 💪' },
  { tr: 'Bugün 3 saat çalıştım! 🎉', en: 'Studied 3 hours today! 🎉' },
  { tr: 'Bu kafe çok rahat 😊', en: 'This cafe is so cozy 😊' },
  { tr: 'Yeni bir şey öğrendim! 💡', en: 'Learned something new! 💡' },
];

// Walking customers that come and go
const WALKING_CUSTOMERS = [
  { emoji: '🚶‍♀️', speed: 8 },
  { emoji: '🚶', speed: 10 },
  { emoji: '🚶‍♂️', speed: 7 },
  { emoji: '🧑‍🦱', speed: 9 },
  { emoji: '👩‍🦰', speed: 11 },
];

export default function CafeCharacters({ language = 'tr', isStudying = false }) {
  const [visibleCharacters, setVisibleCharacters] = useState([]);
  const [speechBubble, setSpeechBubble] = useState(null);
  const [walkingCustomers, setWalkingCustomers] = useState([]);

  // Initialize and rotate visible characters
  useEffect(() => {
    // Start with 3-4 random characters
    const shuffled = [...CHARACTERS].sort(() => Math.random() - 0.5);
    setVisibleCharacters(shuffled.slice(0, 4));

    // Rotate characters every 30-60 seconds
    const rotateInterval = setInterval(() => {
      setVisibleCharacters(prev => {
        const remaining = CHARACTERS.filter(c => !prev.find(p => p.id === c.id));
        if (remaining.length === 0) return prev;
        
        // Remove one random character and add a new one
        const newChars = [...prev];
        const removeIndex = Math.floor(Math.random() * newChars.length);
        newChars.splice(removeIndex, 1);
        
        const addChar = remaining[Math.floor(Math.random() * remaining.length)];
        newChars.push(addChar);
        
        return newChars;
      });
    }, 30000 + Math.random() * 30000);

    return () => clearInterval(rotateInterval);
  }, []);

  // Show random speech bubbles
  useEffect(() => {
    const showBubble = () => {
      if (visibleCharacters.length === 0) return;
      
      const randomChar = visibleCharacters[Math.floor(Math.random() * visibleCharacters.length)];
      const randomBubble = SPEECH_BUBBLES[Math.floor(Math.random() * SPEECH_BUBBLES.length)];
      
      setSpeechBubble({
        characterId: randomChar.id,
        text: language === 'tr' ? randomBubble.tr : randomBubble.en
      });

      // Hide after 4 seconds
      setTimeout(() => setSpeechBubble(null), 4000);
    };

    // Show bubble every 15-30 seconds
    const bubbleInterval = setInterval(showBubble, 15000 + Math.random() * 15000);
    
    // Show first bubble after 5 seconds
    setTimeout(showBubble, 5000);

    return () => clearInterval(bubbleInterval);
  }, [visibleCharacters, language]);

  // Walking customers that pass by
  useEffect(() => {
    const addWalkingCustomer = () => {
      const customer = WALKING_CUSTOMERS[Math.floor(Math.random() * WALKING_CUSTOMERS.length)];
      const direction = Math.random() > 0.5 ? 'left-to-right' : 'right-to-left';
      const id = Date.now();
      
      setWalkingCustomers(prev => [...prev, { ...customer, id, direction }]);
      
      // Remove after animation
      setTimeout(() => {
        setWalkingCustomers(prev => prev.filter(c => c.id !== id));
      }, customer.speed * 1000 + 1000);
    };

    // Add walking customer every 20-40 seconds
    const walkInterval = setInterval(addWalkingCustomer, 20000 + Math.random() * 20000);
    
    // First walker after 3 seconds
    setTimeout(addWalkingCustomer, 3000);

    return () => clearInterval(walkInterval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Seated characters */}
      <AnimatePresence mode="popLayout">
        {visibleCharacters.map((char) => (
          <motion.div
            key={char.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0, transition: { duration: 0.3 } }}
            transition={{ type: "spring", duration: 0.5 }}
            className="absolute"
            style={{ left: `${char.position.x}%`, top: `${char.position.y}%` }}
          >
            {/* Character */}
            <motion.div
              animate={{ 
                y: [0, -3, 0],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2 + Math.random(),
                ease: "easeInOut"
              }}
              className="relative"
            >
              {/* Speech bubble */}
              <AnimatePresence>
                {speechBubble?.characterId === char.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.8 }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap z-10"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    <span className="text-xs text-[#5D4E37]">{speechBubble.text}</span>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Character emoji */}
              <div className="text-3xl md:text-4xl cursor-default select-none drop-shadow-lg">
                {char.emoji}
              </div>

              {/* Activity indicator when studying */}
              {isStudying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-2 -right-2 text-sm"
                >
                  {Math.random() > 0.5 ? '💭' : '📝'}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Walking customers */}
      <AnimatePresence>
        {walkingCustomers.map((customer) => (
          <motion.div
            key={customer.id}
            initial={{ 
              x: customer.direction === 'left-to-right' ? '-10%' : '110%',
              opacity: 0
            }}
            animate={{ 
              x: customer.direction === 'left-to-right' ? '110%' : '-10%',
              opacity: [0, 1, 1, 0]
            }}
            transition={{ 
              duration: customer.speed,
              ease: "linear"
            }}
            className="absolute bottom-[25%] text-2xl md:text-3xl"
            style={{ 
              transform: customer.direction === 'right-to-left' ? 'scaleX(-1)' : 'none'
            }}
          >
            {customer.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Ambient particles */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + '%',
              y: 100 + '%',
              opacity: 0
            }}
            animate={{ 
              y: '-10%',
              opacity: [0, 0.6, 0],
            }}
            transition={{ 
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 2,
              ease: "linear"
            }}
            className="absolute text-lg opacity-30"
          >
            {['✨', '☕', '📚', '🎵', '💫'][i]}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
