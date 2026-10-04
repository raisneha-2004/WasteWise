import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, X, Bot, Sparkles, Volume2, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/useApp.js';
import { assistantApi } from '../services/api.js';
import { speakText, stopSpeaking, isSpeechRecognitionSupported, createSpeechRecognizer } from '../utils/speech.js';
import { SPEECH_LANG_MAP } from '../utils/speechLangMap.js';
import toast from 'react-hot-toast';

export default function VoiceAssistant() {
  const { language, lastScannedItem } = useApp();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome',
      role: 'assistant',
      text: t('assistant.welcome_msg', {
        defaultValue: 'Namaste! Main WasteWise AI Assistant hoon. Waste segregation, recycling ya compost ke baare mein koi bhi sawal poochhein.'
      })
    }
  ]);

  const prevLangRef = useRef(language);

  // Update welcome message when language changes after initial render
  useEffect(() => {
    if (prevLangRef.current !== language) {
      prevLangRef.current = language;
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          text: t('assistant.welcome_msg', {
            defaultValue: 'Namaste! Main WasteWise AI Assistant hoon. Waste segregation, recycling ya compost ke baare mein koi bhi sawal poochhein.'
          })
        }
      ]);
      stopSpeaking();
    }
  }, [language, t]);

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Clean up speech recognition on close or unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopSpeaking();
    };
  }, []);

  // Initialize Speech Recognition
  const toggleListening = () => {
    if (!isSpeechRecognitionSupported()) {
      toast.error(t('speech.stt_unsupported', { defaultValue: 'Voice input is not supported in this browser. Please type your query.' }));
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const speechLang = SPEECH_LANG_MAP[language] || 'en-IN';
      const recognizer = createSpeechRecognizer({
        lang: speechLang,
        onResult: (transcript) => {
          setInputText(transcript);
          setIsListening(false);
          handleSendMessage(transcript);
        },
        onError: (err) => {
          console.warn('Speech recognition error:', err);
          setIsListening(false);
          toast.error(t('speech.stt_error', { defaultValue: 'Could not capture audio clearly. Please try typing.' }));
        },
        onEnd: () => {
          setIsListening(false);
        }
      });

      recognitionRef.current = recognizer;
      recognizer.start();
      setIsListening(true);
      toast(t('assistant.listening_toast', { defaultValue: 'Listening... Speak now 🎙️' }), {
        id: 'mic-toast',
        duration: 3000,
        style: { background: '#162329', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }
      });
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || loading) return;

    setInputText('');
    const userMsg = { id: 'usr-' + Date.now(), role: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const payload = {
        question: query,
        language,
        context: lastScannedItem
          ? { lastItem: lastScannedItem.name, category: lastScannedItem.category }
          : {}
      };

      const res = await assistantApi.ask(payload);
      const answer =
        res.data?.answer ||
        t('assistant.default_reply', { defaultValue: 'Please ask questions related to waste segregation and recycling.' });

      const botMsg = { id: 'bot-' + Date.now(), role: 'assistant', text: answer };
      setMessages((prev) => [...prev, botMsg]);

      // Speak answer automatically in selected language
      speakText({
        text: answer,
        language
      });
    } catch {
      const fallbackMsg = {
        id: 'bot-err-' + Date.now(),
        role: 'assistant',
        text: t('assistant.network_error', {
          defaultValue: 'Unable to connect to assistant service. Please try again shortly.'
        })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-20 lg:bottom-6 right-5 z-40">
        <div className="relative">
          {/* Multiple expanding ripple waves during listening state */}
          {isListening && (
            <>
              <motion.span
                animate={{ scale: [1, 2.2], opacity: [0.8, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-rose-500/40 pointer-events-none"
              />
              <motion.span
                animate={{ scale: [1, 2.6], opacity: [0.6, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
                className="absolute inset-0 rounded-full bg-rose-500/30 pointer-events-none"
              />
            </>
          )}

          {/* Idle pulse ring indicator */}
          {!isListening && (
            <motion.span
              animate={{ scale: [1, 1.4, 1.6], opacity: [0.5, 0.2, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-eco-500/30 pointer-events-none"
            />
          )}

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              if (isOpen) stopSpeaking();
              setIsOpen(!isOpen);
            }}
            className={`relative p-3.5 md:p-4 rounded-full text-white shadow-glow-lg border border-white/20 flex items-center justify-center transition-colors ${
              isListening
                ? 'bg-rose-600 shadow-[0_0_25px_#f43f5e]'
                : 'bg-gradient-to-tr from-eco-600 to-emerald-400'
            }`}
            aria-label={t('assistant.title', { defaultValue: 'Voice Assistant' })}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            <span className="sr-only">{t('assistant.title', { defaultValue: 'Voice Assistant' })}</span>
          </motion.button>
        </div>
      </div>

      {/* Assistant Modal / Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 25, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 25 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-36 lg:bottom-24 right-4 md:right-8 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[520px] h-[480px] glass-panel rounded-3xl shadow-2xl border border-white/10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-dark-surface/80 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-eco-500/20 text-eco-400 flex items-center justify-center border border-eco-500/30">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{t('assistant.header_title', { defaultValue: 'WasteWise AI' })}</span>
                    <Sparkles className="w-3.5 h-3.5 text-eco-400" />
                  </h4>
                  <p className="text-[10px] text-gray-400">
                    {lastScannedItem ? `${t('assistant.context', { defaultValue: 'Context' })}: ${lastScannedItem.name}` : t('assistant.subtitle', { defaultValue: 'Eco Voice Counselor' })}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body with animated messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-lg bg-eco-500/20 text-eco-400 flex items-center justify-center shrink-0 text-xs border border-eco-500/30 mt-1">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs md:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-eco-600 text-white font-medium rounded-tr-none'
                        : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => {
                          speakText({ text: msg.text, language });
                        }}
                        className="mt-1.5 flex items-center gap-1 text-[10px] text-eco-400/80 hover:text-eco-400 transition-colors"
                        title={t('assistant.replay', { defaultValue: 'Replay' })}
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{t('assistant.replay', { defaultValue: 'Replay' })}</span>
                      </button>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-lg bg-white/10 text-gray-300 flex items-center justify-center shrink-0 text-xs mt-1">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* 3 Dots Bounce Typing Indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 text-xs w-fit"
                >
                  <div className="flex items-center gap-1 py-1 px-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-eco-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-eco-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-eco-400 animate-bounce" />
                  </div>
                  <span className="text-[11px] text-eco-400 font-medium ml-1">{t('assistant.thinking', { defaultValue: 'Assistant thinking...' })}</span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-dark-surface/80 border-t border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isListening
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse shadow-[0_0_15px_#f43f5e]'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-eco-400'
                  }`}
                  title={isListening ? t('assistant.stop_listening', { defaultValue: 'Stop listening' }) : t('assistant.speak_prompt', { defaultValue: 'Speak your question' })}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isListening
                      ? t('assistant.listening_now', { defaultValue: 'Listening...' })
                      : t('assistant.placeholder', { defaultValue: 'Ask a waste or recycling question...' })
                  }
                  className="flex-1 bg-dark-bg/60 border border-white/10 rounded-xl px-3 py-2 text-xs md:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-eco-500 transition-colors"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || loading}
                  className="p-2.5 rounded-xl bg-eco-600 hover:bg-eco-500 disabled:opacity-40 disabled:hover:bg-eco-600 text-white transition-colors"
                  aria-label={t('assistant.send', { defaultValue: 'Send' })}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

