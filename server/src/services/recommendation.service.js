import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCategoryById } from './classifier.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load base disposal rules dataset
const rulesFilePath = path.join(__dirname, '../../data/disposalRules.json');
const disposalRules = JSON.parse(fs.readFileSync(rulesFilePath, 'utf-8'));

/**
 * Multilingual Translations for Bin Names, Steps, Dos, Donts, and Speech Summaries
 */
export const MULTILINGUAL_DISPOSAL = {
  Plastic: {
    binNames: {
      en: 'Dry Waste Bin (Blue)',
      hinglish: 'Neela Dabba (Dry Waste Bin)',
      hi: 'नीला डब्बा (सूखा पुनर्चक्रण कचरा)',
      bn: 'নীল ডাস্টবিন (শুকনো পুনর্ব্যবহারযোগ্য)',
      ta: 'நீல தொட்டி (மறுசுழற்சி உலர் கழிவு)',
      te: 'నీలం డస్ట్ బిన్ (పొడి పునర్వినియోగ వ్యర్థాలు)',
      mr: 'निळा डबा (सुका पुनर्वापर कचरा)',
      gu: 'વાદળી કચરાપેટી (સૂકો રિસાયકલ કચરો)',
      pa: 'ਨੀਲਾ ਡੱਬਾ (ਸੁੱਕਾ ਰੀਸਾਈਕਲ ਕੂੜਾ)',
      kn: 'ನೀಲಿ ಕಸದ ಬುಟ್ಟಿ (ಒಣ ಮರುಬಳಕೆ ತ್ಯಾಜ್ಯ)'
    },
    speechText: {
      en: 'This is plastic waste. Please rinse, crush, and dispose of it into the blue dry waste bin.',
      hinglish: 'Yeh plastic waste hai. Isse dho kar crush karein aur neelay dry waste bin mein daalein.',
      hi: 'यह प्लास्टिक कचरा है। कृपया इसे धोकर, दबाकर नीले सूखे कचरे के डिब्बे में डालें।',
      bn: 'এটি প্লাস্টিক বর্জ্য। দয়া করে ধুয়ে চ্যাপ্টা করে নীল শুকনো ডাস্টবিনে ফেলুন।',
      ta: 'இது பிளாஸ்டிக் கழிவு. தயவுசெய்து கழுவி, நசுக்கி நீல நிற உலர் குப்பைத் தொட்டியில் போடுங்கள்.',
      te: 'ఇది ప్లాస్టిక్ వ్యర్థం. దయచేసి కడిగి, నలిపి నీలం రంగు పొడి చెత్త డబ్బాలో వేయండి.',
      mr: 'हा प्लास्टिक कचरा आहे. कृपया स्वच्छ धुवून, दाबून निळ्या सुक्या कचऱ्याच्या डब्यात टाका.',
      gu: 'આ પ્લાસ્ટિક કચરો છે. કૃપા કરીને ધોઈને, દબાવીને વાદળી સૂકા કચરાપેટીમાં નાખો.',
      pa: 'ਇਹ ਪਲਾਸਟਿਕ ਦਾ ਕੂੜਾ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਧੋ ਕੇ, ਦਬਾ ਕੇ ਨੀਲੇ ਸੁੱਕੇ ਕੂੜੇਦਾਨ ਵਿੱਚ ਪਾਓ।',
      kn: 'ಇದು ಪ್ಲಾಸ್ಟಿಕ್ ತ್ಯಾಜ್ಯ. ದಯವಿಟ್ಟು ತೊಳೆದು, ಪುಡಿಮಾಡಿ ನೀಲಿ ಬಣ್ಣದ ಒಣ ಕಸದ ಬುಟ್ಟಿಗೆ ಹಾಕಿ.'
    },
    speechTextNative: 'यह प्लास्टिक कचरा है। इसे धो कर क्रश करें और नीले ड्राई वेस्ट बिन में डालें।'
  },
  Paper: {
    binNames: {
      en: 'Paper & Cardboard Bin (Blue)',
      hinglish: 'Neela Dabba (Paper & Cardboard)',
      hi: 'नीला डब्बा (कागज और गत्ता)',
      bn: 'নীল ডাস্টবিন (কাগজ ও কার্ডবোর্ড)',
      ta: 'நீல தொட்டி (காகிதம் மற்றும் அட்டை)',
      te: 'నీలం డస్ట్ బిన్ (కాగితం మరియు కార్డ్‌బోర్డ్)',
      mr: 'निळा डबा (कागद आणि पुठ्ठा)',
      gu: 'વાદળી કચરાપેટી (કાગળ અને પૂંઠા)',
      pa: 'ਨੀਲਾ ਡੱਬਾ (ਕਾਗਜ਼ ਅਤੇ ਗੱਤਾ)',
      kn: 'ನೀಲಿ ಕಸದ ಬುಟ್ಟಿ (ಕಾಗದ ಮತ್ತು ಕಾರ್ಡ್‌ಬೋರ್ಡ್)'
    },
    speechText: {
      en: 'This is clean paper or cardboard. Keep it dry, flatten boxes, and place in the blue bin.',
      hinglish: 'Yeh paper ya cardboard hai. Isse sookha rakhein aur neelay recycle bin mein daalein.',
      hi: 'यह साफ कागज या गत्ता है। इसे सूखा रखें और नीले रीसाइक्लिंग डिब्बे में डालें।',
      bn: 'এটি কাগজ বা কার্ডবোর্ড। এটি শুকনো রাখুন এবং নীল পুনর্ব্যবহারযোগ্য ডাস্টবিনে ফেলুন।',
      ta: 'இது காகிதம் அல்லது அட்டை. இதை உலர்வாக வைத்து நீல நிற மறுசுழற்சி தொட்டியில் போடுங்கள்.',
      te: 'ఇది కాగితం లేదా కార్డ్‌బోర్డ్. దీనిని పొడిగా ఉంచి నీలం రీసైక్లింగ్ డబ్బాలో వేయండి.',
      mr: 'हा कागद किंवा पुठ्ठा आहे. तो कोरडा ठेवा आणि निळ्या पुनर्वापर डब्यात टाका.',
      gu: 'આ કાગળ અથવા પૂંઠું છે. તેને સૂકું રાખો અને વાદળી રિસાયક્લિંગ ડબ્બામાં નાખો.',
      pa: 'ਇਹ ਕਾਗਜ਼ ਜਾਂ ਗੱਤਾ ਹੈ। ਇਸ ਨੂੰ ਸੁੱਕਾ ਰੱਖੋ ਅਤੇ ਨੀਲੇ ਰੀਸਾਈਕਲਿੰਗ ਡੱਬੇ ਵਿੱਚ ਪਾਓ।',
      kn: 'ಇದು ಕಾಗದ ಅಥವಾ ಕಾರ್ಡ್‌ಬೋರ್ಡ್. ಇದನ್ನು ಒಣಗಿಸಿ ನೀಲಿ ಮರುಬಳಕೆ ಬುಟ್ಟಿಗೆ ಹಾಕಿ.'
    },
    speechTextNative: 'यह पेपर या कार्डबोर्ड है। इसे सूखा रखें और नीले रीसायकल बिन में डालें।'
  },
  Glass: {
    binNames: {
      en: 'Glass Recycling Bin (Teal / Blue)',
      hinglish: 'Neela/Teal Dabba (Glass Recycling)',
      hi: 'टील / नीला डब्बा (कांच पुनर्चक्रण)',
      bn: 'টিল / নীল ডাস্টবিন (কাঁচ পুনর্ব্যবহার)',
      ta: 'கண்ணாடி மறுசுழற்சி தொட்டி (டீல் / நீலம்)',
      te: 'గాజు రీసైక్లింగ్ డస్ట్ బిన్',
      mr: 'काच पुनर्वापर डबा',
      gu: 'કાચ રિસાયક્લિંગ કચરાપેટી',
      pa: 'ਕੱਚ ਰੀਸਾਈਕਲਿੰਗ ਡੱਬਾ',
      kn: 'ಗಾಜು ಮರುಬಳಕೆ ಕಸದ ಬುಟ್ಟಿ'
    },
    speechText: {
      en: 'This is glass. Handle carefully without breaking, rinse clean, and dispose in the glass bin.',
      hinglish: 'Yeh glass item hai. Sambhal kar bina tode saaf karke glass recycling bin mein daalein.',
      hi: 'यह कांच की वस्तु है। सावधानी से संभालें और कांच के रीसाइक्लिंग डिब्बे में डालें।',
      bn: 'এটি কাঁচের বস্তু। সাবধানে রাখুন এবং কাঁচের পুনর্ব্যবহারযোগ্য ডাস্টবিনে ফেলুন।',
      ta: 'இது கண்ணாடி பொருள். உடையாமல் கவனமாக கையாண்டு கண்ணாடி தொட்டியில் போடுங்கள்.',
      te: 'ఇది గాజు వస్తువు. పగలకుండా జాగ్రత్తగా గాజు రీసైక్లింగ్ డబ్బాలో వేయండి.',
      mr: 'ही काचेची वस्तू आहे. काळजीपूर्वक हाताळा आणि काच पुनर्वापर डब्यात टाका.',
      gu: 'આ કાચની વસ્તુ છે. કાળજીપૂર્વક સંભાળો અને કાચની કચરાપેટીમાં નાખો.',
      pa: 'ਇਹ ਕੱਚ ਦੀ ਵਸਤੂ ਹੈ। ਧਿਆਨ ਨਾਲ ਸੰਭਾਲੋ ਅਤੇ ਕੱਚ ਦੇ ਡੱਬੇ ਵਿੱਚ ਪਾਓ।',
      kn: 'ಇದು ಗಾಜಿನ ವಸ್ತು. ಎಚ್ಚರಿಕೆಯಿಂದ ನಿರ್ವಹಿಸಿ ಮತ್ತು ಗಾಜಿನ ಮರುಬಳಕೆ ಬುಟ್ಟಿಗೆ ಹಾಕಿ.'
    },
    speechTextNative: 'यह ग्लास आइटम है। संभाल कर बिना तोड़े साफ करके ग्लास रीसायकलिंग बिन में डालें।'
  },
  Metal: {
    binNames: {
      en: 'Metal Scrap Bin (Grey / Blue)',
      hinglish: 'Sookha Dabba (Metal Scrap)',
      hi: 'धूसर / नीला डब्बा (धातु स्क्रैप)',
      bn: 'ধূসর / নীল ডাস্টবিন (ধাতব স্ক্র্যাপ)',
      ta: 'உலோக ஸ்கிராப் தொட்டி',
      te: 'లోహ వ్యర్థాల డస్ట్ బిన్',
      mr: 'धातू भंगार डबा',
      gu: 'ધાતુ ભંગાર કચરાપેટી',
      pa: 'ਧਾਤੂ ਕਬਾੜ ਡੱਬਾ',
      kn: 'ಲೋಹದ ತ್ಯಾಜ್ಯ ಬುಟ್ಟಿ'
    },
    speechText: {
      en: 'This is metal waste. Clean cans or containers and give them to metal recyclers or dry waste bin.',
      hinglish: 'Yeh metal item hai. Isse saaf karke kabadiwale ko ya metal recycle bin mein dein.',
      hi: 'यह धातु का कचरा है। इसे साफ करके कबाड़ीवाले को या धातु रीसाइक्लिंग डिब्बे में दें।',
      bn: 'এটি ধাতব বর্জ্য। পরিষ্কার করে ধাতু পুনর্ব্যবহারকারীকে বা শুকনো ডাস্টবিনে দিন।',
      ta: 'இது உலோக கழிவு. சுத்தம் செய்து உலோகம் சேகரிப்பவரிடம் அல்லது உலர் தொட்டியில் போடுங்கள்.',
      te: 'ఇది లోహ వ్యర్థం. శుభ్రం చేసి మెటల్ రీసైక్లర్లకు లేదా డ్రై బిన్‌కు ఇవ్వండి.',
      mr: 'हा धातूचा कचरा आहे. स्वच्छ करून भंगारवाल्याला किंवा धातू डब्यात द्या.',
      gu: 'આ ધાતુનો કચરો છે. સાફ કરીને ભંગારવાળાને અથવા ડબ્બામાં આપો.',
      pa: 'ਇਹ ਧਾਤੂ ਦਾ ਕੂੜਾ ਹੈ। ਸਾਫ਼ ਕਰਕੇ ਕਬਾੜੀਏ ਨੂੰ ਜਾਂ ਰੀਸਾਈਕਲ ਡੱਬੇ ਵਿੱਚ ਪਾਓ।',
      kn: 'ಇದು ಲೋಹದ ತ್ಯಾಜ್ಯ. ಸ್ವಚ್ಛಗೊಳಿಸಿ ಲೋಹದ ಮರುಬಳಕೆದಾರರಿಗೆ ಅಥವಾ ಬುಟ್ಟಿಗೆ ನೀಡಿ.'
    },
    speechTextNative: 'यह मेटल आइटम है। इसे साफ करके कबाड़ीवाले को या मेटल रीसायकल बिन में दें।'
  },
  Organic: {
    binNames: {
      en: 'Wet / Compost Bin (Green)',
      hinglish: 'Hara Dabba (Geela Kooda / Compost)',
      hi: 'हरा डब्बा (गीला कचरा व खाद)',
      bn: 'সবুজ ডাস্টবিন (ভেজা বর্জ্য ও কম্পোস্ট)',
      ta: 'பச்சை தொட்டி (ஈரக் கழிவு / உரம்)',
      te: 'ఆకుపచ్చ డస్ట్ బిన్ (తడి చెత్త / కంపోస్ట్)',
      mr: 'हिरवा डबा (ओला कचरा व खत)',
      gu: 'લીલી કચરાપેટી (ભીનો કચરો અને ખાતર)',
      pa: 'ਹਰਾ ਡੱਬਾ (ਗਿੱਲਾ ਕੂੜਾ / ਖਾਦ)',
      kn: 'ಹಸಿರು ಕಸದ ಬುಟ್ಟಿ (ಹಸಿ ತ್ಯಾಜ್ಯ ಮತ್ತು ಗೊಬ್ಬರ)'
    },
    speechText: {
      en: 'This is biodegradable organic waste. Place it in the green wet waste bin for composting.',
      hinglish: 'Yeh geela organic kooda hai. Isse hare dabbay mein compost ya khad ke liye daalein.',
      hi: 'यह गीला जैविक कचरा है। इसे खाद बनाने के लिए हरे गीले कचरे के डिब्बे में डालें।',
      bn: 'এটি পচনশীল জৈব বর্জ্য। কম্পোস্ট তৈরির জন্য সবুজ ভেজা ডাস্টবিনে ফেলুন।',
      ta: 'இது மக்கும் இயற்கை கழிவு. உரமாக்குவதற்காக பச்சை நிற ஈர தொட்டியில் போடுங்கள்.',
      te: 'ఇది సేంద్రీయ వ్యర్థం. కంపోస్ట్ తయారీకి ఆకుపచ్చ తడి చెత్త డబ్బాలో వేయండి.',
      mr: 'हा ओला सेंद्रिय कचरा आहे. खत तयार करण्यासाठी हिरव्या ओल्या कचऱ्याच्या डब्यात टाका.',
      gu: 'આ ભીનો જૈવિક કચરો છે. ખાતર બનાવવા માટે લીલી કચરાપેટીમાં નાખો.',
      pa: 'ਇਹ ਜੈਵਿਕ ਗਿੱਲਾ ਕੂੜਾ ਹੈ। ਖਾਦ ਬਣਾਉਣ ਲਈ ਹਰੇ ਡੱਬੇ ਵਿੱਚ ਪਾਓ।',
      kn: 'ಇದು ಸಾವಯವ ಹಸಿ ತ್ಯಾಜ್ಯ. ಗೊಬ್ಬರಕ್ಕಾಗಿ ಹಸಿರು ಕಸದ ಬುಟ್ಟಿಗೆ ಹಾಕಿ.'
    },
    speechTextNative: 'यह गीला ऑर्गेनिक कूड़ा है। इसे हरे डिब्बे में कंपोस्ट या खाद के लिए डालें।'
  },
  'E-waste': {
    binNames: {
      en: 'Authorized E-Waste Collection Bin',
      hinglish: 'E-waste Drop Point / Special Bin',
      hi: 'ई-कचरा विशेष केंद्र (ई-वेस्ट ड्रॉप पॉइंट)',
      bn: 'ই-বর্জ্য ড্রপ পয়েন্ট',
      ta: 'மின்-கழிவு சிறப்பு சேகரிப்பு மையம்',
      te: 'ఇ-వ్యర్థాల డ్రాప్ పాయింట్',
      mr: 'ई-कचरा विशेष संकलन केंद्र',
      gu: 'ઇ-વેસ્ટ સંગ્રહ કેન્દ્ર',
      pa: 'ਈ-ਕੂੜਾ ਵਿਸ਼ੇਸ਼ ਕੇਂਦਰ',
      kn: 'ಇ-ತ್ಯಾಜ್ಯ ವಿಶೇಷ ಸಂಗ್ರಹಣಾ ಕೇಂದ್ರ'
    },
    speechText: {
      en: 'This is electronic waste. Do not throw in regular bins. Drop it at an authorized e-waste facility.',
      hinglish: 'Yeh electronic e-waste hai. Regular dustbin mein na daalein. Nazdeeki e-waste center par dein.',
      hi: 'यह इलेक्ट्रॉनिक कचरा है। इसे सामान्य कूड़ेदान में न फेंकें। अधिकृत ई-कचरा केंद्र पर दें।',
      bn: 'এটি ইলেকট্রনিক বর্জ্য। সাধারণ ডাস্টবিনে ফেলবেন না। অনুমোদিত ই-বর্জ্য কেন্দ্রে জমা দিন।',
      ta: 'இது மின்னணு கழிவு. சாதாரண தொட்டியில் போடாதீர்கள். அங்கீகரிக்கப்பட்ட மின்-கழிவு மையத்தில் கொடுங்கள்.',
      te: 'ఇది ఎలక్ట్రానిక్ వ్యర్థం. సాధారణ డబ్బాలో వేయవద్దు. అధీకృత ఈ-వ్యర్థ కేంద్రంలో ఇవ్వండి.',
      mr: 'हा इलेक्ट्रॉनिक कचरा आहे. सामान्य कचऱ्यात टाकू नका. अधिकृत ई-कचरा केंद्रात द्या.',
      gu: 'આ ઇલેક્ટ્રોનિક કચરો છે. સામાન્ય કચરાપેટીમાં ન નાખો. અધિકૃત ઇ-વેસ્ટ કેન્દ્ર પર આપો.',
      pa: 'ਇਹ ਇਲੈਕਟ੍ਰਾਨਿਕ ਕੂੜਾ ਹੈ। ਆਮ ਕੂੜੇਦਾਨ ਵਿੱਚ ਨਾ ਸੁੱਟੋ। ਪ੍ਰਮਾਣਿਤ ਈ-ਕੂੜਾ ਕੇਂਦਰ ਵਿੱਚ ਜਮ੍ਹਾ ਕਰੋ।',
      kn: 'ಇದು ಎಲೆಕ್ಟ್ರಾನಿಕ್ ತ್ಯಾಜ್ಯ. ಸಾಮಾನ್ಯ ಕಸದ ಬುಟ್ಟಿಗೆ ಹಾಕಬೇಡಿ. ಅಧಿಕೃತ ಇ-ತ್ಯಾಜ್ಯ ಕೇಂದ್ರಕ್ಕೆ ನೀಡಿ.'
    },
    speechTextNative: 'यह इलेक्ट्रॉनिक ई-वेस्ट है। रेगुलर डस्टबिन में न डालें। नजदीकी ई-वेस्ट केंद्र पर दें।'
  },
  Hazardous: {
    binNames: {
      en: 'Hazardous Waste Safe Disposal (Red / Black)',
      hinglish: 'Laal Dabba (Hazardous Waste)',
      hi: 'लाल डब्बा (खतरनाक व विषैला कचरा)',
      bn: 'লাল ডাস্টবিন (বিপজ্জনক বর্জ্য)',
      ta: 'சிவப்பு தொட்டி (அபாயகரமான கழிவு)',
      te: 'ఎరుపు డస్ట్ బిన్ (ప్రమాదకర వ్యర్థాలు)',
      mr: 'लाल डबा (धोकादायक कचरा)',
      gu: 'લાલ કચરાપેટી (જોખમી કચરો)',
      pa: 'ਲਾਲ ਡੱਬਾ (ਖਤਰਨਾਕ ਕੂੜਾ)',
      kn: 'ಕೆಂಪು ಕಸದ ಬುಟ್ಟಿ (ಅಪಾಯಕಾರಿ ತ್ಯಾಜ್ಯ)'
    },
    speechText: {
      en: 'Warning: This is hazardous waste. Wrap securely, keep away from children, and take to hazardous collection point.',
      hinglish: 'Savdhaan: Yeh hazardous kooda hai. Baccho se door rakhein aur special hazardous drop center par dein.',
      hi: 'सावधान: यह खतरनाक कचरा है। इसे सुरक्षित लपेटें और विशेष खतरनाक अपशिष्ट केंद्र पर दें।',
      bn: 'সতর্কতা: এটি বিপজ্জনক বর্জ্য। সাবধানে মোড়কজাত করে বিশেষ বর্জ্য কেন্দ্রে দিন।',
      ta: 'எச்சரிக்கை: இது அபாயகரமான கழிவு. பாதுகாப்பாக மூடி சிறப்பு கழிவு மையத்தில் கொடுங்கள்.',
      te: 'హెచ్చరిక: ఇది ప్రమాదకర వ్యర్థం. జాగ్రత్తగా చుట్టి ప్రత్యేక ప్రమాదకర వ్యర్థ కేంద్రంలో ఇవ్వండి.',
      mr: 'सावधान: हा धोकादायक कचरा आहे. सुरक्षित गुंडाळून विशेष कचरा केंद्रात द्या.',
      gu: 'ચેતવણી: આ જોખમી કચરો છે. સુરક્ષિત રીતે લપેટીને ખાસ કેન્દ્ર પર આપો.',
      pa: 'ਚੇਤਾਵਨੀ: ਇਹ ਖ਼ਤਰਨਾਕ ਕੂੜਾ ਹੈ। ਸੁਰੱਖਿਅਤ ਲਪੇਟ ਕੇ ਵਿਸ਼ੇਸ਼ ਕੇਂਦਰ ਵਿੱਚ ਦਿਓ।',
      kn: 'ಎಚ್ಚರಿಕೆ: ಇದು ಅಪಾಯಕಾರಿ ತ್ಯಾಜ್ಯ. ಸುರಕ್ಷಿತವಾಗಿ ಸುತ್ತಿ ವಿಶೇಷ ತ್ಯಾಜ್ಯ ಕೇಂದ್ರಕ್ಕೆ ನೀಡಿ.'
    },
    speechTextNative: 'सावधान: यह खतरनाक कूड़ा है। बच्चों से दूर रखें और स्पेशल हज़ार्डस सेंटर पर दें।'
  },
  Textile: {
    binNames: {
      en: 'Textile & Cloth Recycling Drop Point',
      hinglish: 'Kapde / Textile Drop Point',
      hi: 'कपड़ा व टेक्सटाइल पुनर्चक्रण केंद्र',
      bn: 'কাপড় ও টেক্সটাইল পুনর্ব্যবহার কেন্দ্র',
      ta: 'துணி மறுசுழற்சி மையம்',
      te: 'వస్త్ర రీసైక్లింగ్ డ్రాప్ పాయింట్',
      mr: 'कापड व वस्त्र पुनर्वापर केंद्र',
      gu: 'કાપડ રિસાયક્લિંગ કેન્દ્ર',
      pa: 'ਕੱਪੜਾ ਰੀਸਾਈਕਲਿੰਗ ਕੇਂਦਰ',
      kn: 'ಬಟ್ಟೆ ಮರುಬಳಕೆ ಕೇಂದ್ರ'
    },
    speechText: {
      en: 'This is textile waste. Donate usable clothes or send damaged fabrics to cloth recycling facilities.',
      hinglish: 'Yeh textile ya kapda hai. Achhe kapde donate karein ya cloth recycling center par dein.',
      hi: 'यह कपड़ा या टेक्सटाइल है। अच्छे कपड़े दान करें या कपड़े के रीसाइक्लिंग केंद्र पर दें।',
      bn: 'এটি কাপড় বা টেক্সটাইল। ভালো কাপড় দান করুন বা কাপড় পুনর্ব্যবহার কেন্দ্রে দিন।',
      ta: 'இது துணி கழிவு. நல்ல ஆடைகளை தானம் செய்யுங்கள் அல்லது மறுசுழற்சி மையத்திற்கு கொடுங்கள்.',
      te: 'ఇది వస్త్ర వ్యర్థం. మంచి బట్టలను దానం చేయండి లేదా రీసైక్లింగ్ కేంద్రానికి ఇవ్వండి.',
      mr: 'हे कापड किंवा वस्त्र आहे. चांगले कपडे दान करा किंवा पुनर्वापर केंद्रात द्या.',
      gu: 'આ કાપડનો કચરો છે. સારા કપડાં દાન કરો અથવા રિસાયક્લિંગ કેન્દ્રમાં આપો.',
      pa: 'ਇਹ ਕੱਪੜਾ ਹੈ। ਚੰਗੇ ਕੱਪੜੇ ਦਾਨ ਕਰੋ ਜਾਂ ਰੀਸਾਈਕਲਿੰਗ ਕੇਂਦਰ ਵਿੱਚ ਦਿਓ।',
      kn: 'ಇದು ಬಟ್ಟೆಯ ತ್ಯಾಜ್ಯ. ಉತ್ತಮ ಬಟ್ಟೆಗಳನ್ನು ದಾನ ಮಾಡಿ ಅಥವಾ ಮರುಬಳಕೆ ಕೇಂದ್ರಕ್ಕೆ ನೀಡಿ.'
    },
    speechTextNative: 'यह टेक्सटाइल या कपड़ा है। अच्छे कपड़े डोनेट करें या क्लॉथ रीसायकलिंग सेंटर पर दें।'
  },
  Other: {
    binNames: {
      en: 'General Waste Bin (Black)',
      hinglish: 'Kaala Dabba (General Waste)',
      hi: 'काला डब्बा (सामान्य अक्रिय कचरा)',
      bn: 'কালো ডাস্টবিন (সাধারণ বর্জ্য)',
      ta: 'கருப்பு தொட்டி (பொது கழிவு)',
      te: 'నలుపు డస్ట్ బిన్ (సాధారణ వ్యర్థాలు)',
      mr: 'काळा डबा (सामान्य कचरा)',
      gu: 'કાળી કચરાપેટી (સામાન્ય કચરો)',
      pa: 'ਕਾਲਾ ਡੱਬਾ (ਆਮ ਕੂੜਾ)',
      kn: 'ಕಪ್ಪು ಕಸದ ಬುಟ್ಟಿ (ಸಾಮಾನ್ಯ ತ್ಯಾಜ್ಯ)'
    },
    speechText: {
      en: 'This item goes into the black general waste bin or check local municipal guidelines.',
      hinglish: 'Isse kaale general waste bin mein daalein aur municipal guidelines check karein.',
      hi: 'इसे काले सामान्य कचरे के डिब्बे में डालें और स्थानीय नगरपालिका दिशानिर्देश देखें।',
      bn: 'এটি কালো সাধারণ বর্জ্য ডাস্টবিনে ফেলুন।',
      ta: 'இதை கருப்பு பொது கழிவு தொட்டியில் போடுங்கள்.',
      te: 'దీనిని నలుపు సాధారణ వ్యర్థాల డబ్బాలో వేయండి.',
      mr: 'हा काळ्या सामान्य कचऱ्याच्या डब्यात टाका.',
      gu: 'આને કાળી સામાન્ય કચરાપેટીમાં નાખો.',
      pa: 'ਇਸ ਨੂੰ ਕਾਲੇ ਆਮ ਕੂੜੇਦਾਨ ਵਿੱਚ ਪਾਓ।',
      kn: 'ಇದನ್ನು ಕಪ್ಪು ಸಾಮಾನ್ಯ ಕಸದ ಬುಟ್ಟಿಗೆ ಹಾಕಿ.'
    },
    speechTextNative: 'इसे काले जनरल वेस्ट बिन में डालें और म्यूनिसिपल गाइडलाइन्स चेक करें।'
  }
};

/**
 * Calculates gamified Eco-Points for proper waste disposal
 */
export function calculateEcoPoints(categoryId, isHazardous, confidence = 0.8) {
  const category = getCategoryById(categoryId);
  const breakdown = [];
  let totalPoints = 0;

  totalPoints += 10;
  breakdown.push({ reason: 'Item Scanned & Identified', points: 10 });

  if (category?.recyclable) {
    totalPoints += 20;
    breakdown.push({ reason: 'Recyclable Material Recovery', points: 20 });
  }

  if (category?.compostable) {
    totalPoints += 15;
    breakdown.push({ reason: 'Compostable Organic Diversion', points: 15 });
  }

  if (isHazardous || categoryId === 'Hazardous' || categoryId === 'E-waste') {
    totalPoints += 30;
    breakdown.push({ reason: 'Hazardous Waste Safe Segregation Bonus', points: 30 });
  }

  if (confidence >= 0.85) {
    totalPoints += 5;
    breakdown.push({ reason: 'High Precision Identification Bonus', points: 5 });
  }

  return {
    totalPoints,
    breakdown
  };
}

/**
 * Generates comprehensive localized disposal recommendation based on category and preferred language
 * @param {string} categoryId
 * @param {string} [language='hinglish']
 * @param {boolean} [isHazardous=false]
 * @param {string} [hazardReason='']
 */
export function getDisposalRecommendation(categoryId, language = 'hinglish', isHazardous = false, hazardReason = '') {
  const normCategory = categoryId || 'Other';
  const rule = disposalRules[normCategory] || disposalRules['Other'];
  const categoryMeta = getCategoryById(normCategory) || getCategoryById('Other');
  const langKey = (language || 'hinglish').toLowerCase();

  const multiData = MULTILINGUAL_DISPOSAL[normCategory] || MULTILINGUAL_DISPOSAL.Other;

  // Language specific bin name
  const binName =
    multiData.binNames[langKey] ||
    (langKey === 'en' ? rule.binNameEn : rule.binNameHinglish) ||
    rule.binNameEn;

  // Language specific steps, dos, donts
  const isEnglish = langKey === 'en';
  const steps = isEnglish ? rule.stepsEn : (rule.stepsHinglish || rule.stepsEn);
  const dos = isEnglish ? rule.dosEn : (rule.dosHinglish || rule.dosEn);
  const donts = isEnglish ? rule.dontsEn : (rule.dontsHinglish || rule.dontsEn);
  const hazardWarning = isEnglish ? rule.hazardWarningEn : (rule.hazardWarningHinglish || rule.hazardWarningEn);

  // Language specific speech text
  const speechText = multiData.speechText[langKey] || multiData.speechText.hinglish || multiData.speechText.en;
  const speechTextNative = multiData.speechTextNative || multiData.speechText.hi || speechText;

  // Select a random tip
  const tips = categoryMeta.tips || [];
  const selectedTip = tips.length > 0 ? tips[Math.floor(Math.random() * tips.length)] : '';

  return {
    bin: {
      color: rule.binColor,
      hexColor: categoryMeta.hexColor,
      name: binName
    },
    steps,
    dos,
    donts,
    hazard: {
      isHazardous: isHazardous || rule.hazardLevel === 'critical' || rule.hazardLevel === 'high',
      level: rule.hazardLevel,
      reason: hazardReason || (rule.hazardLevel !== 'none' ? hazardWarning : 'Safe to handle normally.'),
      warning: hazardWarning
    },
    tip: selectedTip,
    speechText,
    speechTextNative
  };
}
