import { askWasteAssistant } from '../services/assistant.service.js';

/**
 * Controller to process AI assistant questions regarding waste and recycling
 */
export async function askAssistant(req, res, next) {
  try {
    const { question, language = 'hinglish', context = {} } = req.body;

    const answer = await askWasteAssistant({
      question,
      language,
      context
    });

    return res.status(200).json({
      success: true,
      data: {
        answer,
        question,
        language
      }
    });
  } catch (err) {
    next(err);
  }
}
