/**
 * Professional Societal Content Moderation & Compliance Engine
 * 
 * Enforces enterprise-grade professional communication standards,
 * blocking vulgarity, offensive language, unauthorized malicious exploit terms,
 * credential harvesting, and harmful scripts.
 */

// List of profane, abusive, toxic, or vulgar terms
const VULGAR_WORDS = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'pussy', 'cunt',
  'whore', 'slut', 'fag', 'nigger', 'nigga', 'retard', 'cock', 'twat',
  'wanker', 'prick', 'motherfucker', 'bullshit', 'douchebag', 'jackass',
  'porn', 'porno', 'nsfw', 'sex', 'nude', 'naked', 'xxx', 'hentai'
];

// List of unauthorized, malicious, or illicit exploit terms
const UNAUTHORIZED_MALICIOUS_TERMS = [
  'ransomware', 'keylogger', 'trojan virus', 'malware payload',
  'ddos botnet', 'wifi cracker', 'steal credit card', 'carding script',
  'brute force bank', 'ddos attack script', 'bypass auth token steal',
  'phishing template', 'steal passwords', 'spyware camera hack',
  'exploit zero-day weapon', 'reverse shell back door', 'crypto drainer',
  'wallet drainer', 'identity theft script'
];

export interface ModerationResult {
  isApproved: boolean;
  blockedTerms: string[];
  category: 'clean' | 'profanity' | 'malicious_exploit' | 'unprofessional_content';
  feedbackMessage?: string;
  sanitizedPrompt?: string;
}

/**
 * Checks a text string against professional societal standards.
 */
export function checkProfessionalContent(text: string): ModerationResult {
  if (!text || text.trim().length === 0) {
    return {
      isApproved: true,
      blockedTerms: [],
      category: 'clean'
    };
  }

  const normalized = text.toLowerCase();
  const matchedBlockedTerms: string[] = [];

  // Check vulgar words
  for (const word of VULGAR_WORDS) {
    // Word boundary or inclusion check
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(normalized) || normalized.includes(word)) {
      if (!matchedBlockedTerms.includes(word)) {
        matchedBlockedTerms.push(word);
      }
    }
  }

  // Check malicious terms
  for (const term of UNAUTHORIZED_MALICIOUS_TERMS) {
    if (normalized.includes(term)) {
      if (!matchedBlockedTerms.includes(term)) {
        matchedBlockedTerms.push(term);
      }
    }
  }

  if (matchedBlockedTerms.length > 0) {
    const isMalicious = matchedBlockedTerms.some(term => 
      UNAUTHORIZED_MALICIOUS_TERMS.includes(term)
    );

    return {
      isApproved: false,
      blockedTerms: matchedBlockedTerms,
      category: isMalicious ? 'malicious_exploit' : 'profanity',
      feedbackMessage: isMalicious
        ? `Request contains restricted exploit or unauthorized security risk terms (${matchedBlockedTerms.join(', ')}). Please rephrase to focus on authorized defensive engineering, ethical development, or standard devops automation.`
        : `Request contains inappropriate language not aligned with professional societal standards (${matchedBlockedTerms.join(', ')}). Please use professional, constructive terminology.`
    };
  }

  return {
    isApproved: true,
    blockedTerms: [],
    category: 'clean'
  };
}

/**
 * Strips or masks any accidental sensitive or unprofessional words
 */
export function sanitizeProfessionalText(text: string): string {
  let result = text;
  for (const word of VULGAR_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, '****');
  }
  return result;
}
