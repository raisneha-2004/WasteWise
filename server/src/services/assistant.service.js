import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

// Pre-defined fallback responses when AI is offline or key is missing
const FALLBACK_ANSWERS = {
  en: {
    general: 'Always rinse containers and keep dry recyclables separated from wet kitchen waste. Check your local municipal guidelines for special e-waste collection days.',
    offtopic: 'I can only assist with waste management, recycling, and sustainable disposal questions. Please ask something related to waste or eco-habits.'
  },
  hinglish: {
    general: 'Sookha kooda (plastic, paper, metal) aur geela kooda hamesha alag rakhein. Broken glass aur batteries ko regular dustbin mein bilkul na daalein.',
    offtopic: 'Main sirf waste management, recycling aur kooda nistaran se jude sawalon ka jawab de sakta hoon. Kripya waste ya environment se judi baat poochhein.'
  },
  hi: {
    general: 'हमेशा सूखा कचरा (प्लास्टिक, कागज, धातु) और गीला कचरा अलग रखें। टूटे कांच और पुरानी बैटरियों को सामान्य कूड़ेदान में न डालें।',
    offtopic: 'मैं केवल कचरा प्रबंधन, रीसाइक्लिंग और पर्यावरण से जुड़े सवालों का उत्तर दे सकता हूँ। कृपया कचरा प्रबंधन से संबंधित प्रश्न पूछें।'
  },
  bn: {
    general: 'সর্বদা শুকনো পুনর্ব্যবহারযোগ্য বর্জ্য এবং ভেজা রান্নাঘরের বর্জ্য আলাদা রাখুন। সাধারণ ডাস্টবিনে ব্যাটারি বা কাঁচ ফেলবেন না।',
    offtopic: 'আমি কেবল বর্জ্য ব্যবস্থাপনা ও পুনর্ব্যবহার সংক্রান্ত প্রশ্নের উত্তর দিতে পারি।'
  },
  ta: {
    general: 'எப்போதும் உலர் மறுசுழற்சி கழிவுகளையும் ஈரக் கழிவுகளையும் தனித்தனியாக வையுங்கள். உடைந்த கண்ணாடி மற்றும் பேட்டரிகளை பொது தொட்டியில் போடாதீர்கள்.',
    offtopic: 'நான் கழிவு மேலாண்மை மற்றும் மறுசுழற்சி தொடர்பான கேள்விகளுக்கு மட்டுமே பதிலளிக்க முடியும்.'
  },
  te: {
    general: 'ఎల్లప్పుడూ పొడి పునర్వినియోగ వ్యర్థాలను మరియు తడి వ్యర్థాలను వేరుగా ఉంచండి.',
    offtopic: 'నేను వ్యర్థాల నిర్వహణ మరియు రీసైక్లింగ్ ప్రశ్నలకు మాత్రమే సమాధానం ఇవ్వగలను.'
  },
  mr: {
    general: 'नेहमी सुका कचरा आणि ओला कचरा वेगळा ठेवा. तुटलेली काच व बॅटऱ्या सामान्य कचऱ्यात टाकू नका.',
    offtopic: 'मी फक्त कचरा व्यवस्थापन आणि पुनर्वापराविषयीच्या प्रश्नांची उत्तरे देऊ शकतो.'
  },
  gu: {
    general: 'હંમેશા સૂકો કચરો અને ભીનો કચરો અલગ રાખો. સામાન્ય કચરાપેટીમાં બેટરી ન નાખો.',
    offtopic: 'હું ફક્ત કચરા વ્યવસ્થાપન અને રિસાયક્લિંગ સંબંધિત પ્રશ્નોના જવાબ આપી શકું છું.'
  },
  pa: {
    general: 'ਹਮੇਸ਼ਾ ਸੁੱਕਾ ਕੂੜਾ ਅਤੇ ਗਿੱਲਾ ਕੂੜਾ ਵੱਖਰਾ ਰੱਖੋ। ਆਮ ਕੂੜੇਦਾਨ ਵਿੱਚ ਬੈਟਰੀਆਂ ਨਾ ਸੁੱਟੋ।',
    offtopic: 'ਮੈਂ ਸਿਰਫ਼ ਕੂੜਾ ਪ੍ਰਬੰਧਨ ਅਤੇ ਰੀਸਾਈਕਲਿੰਗ ਸੰਬੰਧੀ ਸਵਾਲਾਂ ਦੇ ਜਵਾਬ ਦੇ ਸਕਦਾ ਹਾਂ।'
  },
  kn: {
    general: 'ಯಾವಾಗಲೂ ಒಣ ಕಸ ಮತ್ತು ಹಸಿ ಕಸವನ್ನು ಪ್ರತ್ಯೇಕವಾಗಿ ಇರಿಸಿ.',
    offtopic: 'ನಾನು ಕಸ ನಿರ್ವಹಣೆ ಮತ್ತು ಮರುಬಳಕೆ ಸಂಬಂಧಿತ ಪ್ರಶ್ನೆಗಳಿಗೆ ಮಾತ್ರ ಉತ್ತರಿಸಬಲ್ಲೆ.'
  }
};

const LANGUAGE_NAMES = {
  hinglish: 'Hinglish (mix of Hindi & English words, friendly Indian colloquial style in Roman script)',
  hi: 'Hindi (हिन्दी in Devanagari script)',
  bn: 'Bengali (বাংলা script)',
  ta: 'Tamil (தமிழ் script)',
  te: 'Telugu (తెలుగు script)',
  mr: 'Marathi (मराठी in Devanagari script)',
  gu: 'Gujarati (ગુજરાતી script)',
  pa: 'Punjabi (ਪੰਜਾਬੀ in Gurmukhi script)',
  kn: 'Kannada (ಕನ್ನಡ script)',
  en: 'clear concise English'
};

const WASTE_KEYWORDS = [
  'waste', 'kachra', 'kooda', 'recycle', 'plastic', 'bottle', 'paper', 'cardboard',
  'glass', 'metal', 'can', 'organic', 'compost', 'khad', 'e-waste', 'battery',
  'hazard', 'dispose', 'disposal', 'bin', 'dabba', 'dustbin', 'dump', 'segregat',
  'kabadi', 'clean', 'swachh', 'environment', 'paryavaran', 'pollution', 'reuse',
  'trash', 'garbage', 'rubbish', 'scrap', 'landfill', 'degrade', 'cloth', 'textile',
  'कचरा', 'कूड़ा', 'प्लास्टिक', 'कागज', 'कांच', 'बैटरी', 'खाद', 'বর্জ্য', 'কচড়া',
  'கழிவு', 'குப்பை', 'ప్లాస్టిక్', 'చెత్త', 'ਕੂੜਾ', 'ಕಸ'
];

function isWasteTopic(question) {
  if (!question) return false;
  const lower = question.toLowerCase();
  return WASTE_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

/**
 * Calls Gemini to answer assistant queries with strict guardrails
 * @param {Object} options
 * @param {string} options.question
 * @param {string} [options.language='hinglish']
 * @param {Object} [options.context]
 * @returns {Promise<string>}
 */
export async function askWasteAssistant({ question, language = 'hinglish', context = {} }) {
  const langKey = (language || 'hinglish').toLowerCase();
  const fallbacks = FALLBACK_ANSWERS[langKey] || FALLBACK_ANSWERS.hinglish;
  const langPromptDesc = LANGUAGE_NAMES[langKey] || LANGUAGE_NAMES.hinglish;

  // Fast check: if question has zero waste keywords and is clearly conversational/off-topic
  if (!isWasteTopic(question) && !context?.category && !context?.lastItem) {
    return fallbacks.offtopic;
  }

  if (!env.VISION_API_KEY) {
    logger.warn('VISION_API_KEY missing for waste assistant. Returning fallback answer.');
    return isWasteTopic(question) ? fallbacks.general : fallbacks.offtopic;
  }

  try {
    const genAI = new GoogleGenerativeAI(env.VISION_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const contextStr = context?.category || context?.lastItem
      ? `User's current context: Item = "${context.lastItem || 'N/A'}", Category = "${context.category || 'N/A'}".`
      : 'No previous item context.';

    const systemPrompt = `You are "WasteWise AI Assistant", an expert eco-counselor in India.
Your mission is to help citizens segregate, recycle, compost, and dispose of waste correctly.

RULES:
1. TOPIC RESTRICTION: Answer ONLY questions related to waste segregation, recycling, composting, e-waste, hazardous materials, and environmental impact.
2. If the user asks anything off-topic (e.g. general knowledge, math, programming, politics, chit-chat unrelated to waste), POLITELY DECLINE in max 1 sentence in the requested language.
3. CONCISENESS: Maximum 2 sentences strictly. Do not write long paragraphs or bullet lists. Keep it crisp for speech playback.
4. LANGUAGE: Answer strictly in ${langPromptDesc}. Even if the user asked their question in another language, you MUST respond in ${langPromptDesc}.
5. ${contextStr}

User Question: "${question}"`;

    const timeoutPromise = new Promise((_, reject) => {
      const timer = setTimeout(() => reject(new Error('AI_TIMEOUT')), 15000);
      if (timer.unref) timer.unref();
    });

    const apiPromise = model.generateContent(systemPrompt);
    const result = await Promise.race([apiPromise, timeoutPromise]);
    const answer = result.response.text().trim();

    return answer || fallbacks.general;
  } catch (err) {
    logger.error('Error in askWasteAssistant:', err.message);
    return isWasteTopic(question) ? fallbacks.general : fallbacks.offtopic;
  }
}
