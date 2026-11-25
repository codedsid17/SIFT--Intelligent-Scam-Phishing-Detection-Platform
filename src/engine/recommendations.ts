import { RiskLevel, ScamCategory } from './types';

const CATEGORY_ADVICE: Record<ScamCategory, string[]> = {
  'Banking Fraud': [
    'Do not click links or call phone numbers provided inside the alert.',
    'Open your banking app directly or call the official number printed on the back of your card.',
    'Never read aloud or forward one-time passcodes (OTPs), PINs, or full card CVVs.',
  ],
  Phishing: [
    'Avoid entering passwords or login credentials on any linked page.',
    'Navigate manually to the service by typing its official address in a fresh browser tab.',
    'If you already entered credentials, change your password immediately and enable app-based 2FA.',
  ],
  'Fake Employment': [
    'Legitimate employers never ask you to pay for training, equipment, or background checks upfront.',
    'Be wary of job interviews conducted exclusively over Telegram, WhatsApp, or unsolicited texts.',
    'Verify the hiring company on its official careers portal before sharing ID documents or bank details.',
  ],
  'Investment Fraud': [
    'Be skeptical of any promise of "guaranteed," "risk-free," or unusually high daily returns.',
    'Never send cryptocurrency, wire transfers, or seed phrases to unknown trading platforms or mentors.',
    'Check whether the firm is registered with your national financial regulator before depositing funds.',
  ],
  'Lottery Scam': [
    'You cannot win a lottery, sweepstakes, or giveaway you never entered.',
    'Never pay "taxes," "processing fees," or shipping charges to unlock a supposed prize.',
    'Delete the message and avoid replying, as responses confirm your number is active for future scams.',
  ],
  'Delivery Scam': [
    'Couriers do not require unexpected small card payments via random text links to release standard parcels.',
    'Track shipments solely through the official courier website or the retailer where you placed the order.',
    'Do not enter payment card details to "confirm an address" or pay redelivery fees from SMS links.',
  ],
  Impersonation: [
    'Independently verify the sender through a trusted, previously known phone number or official portal.',
    'Government agencies and tech support teams do not demand payment via gift cards, crypto, or wire transfer.',
    'Never install remote-access tools (such as AnyDesk or TeamViewer) at the request of an unsolicited caller or message.',
  ],
  'Social Engineering': [
    'Pause before acting—urgency, fear, and secrecy ("don\'t tell anyone") are deliberate manipulation tactics.',
    'Verify unusual requests from colleagues, friends, or support agents via a separate communication channel.',
    'Keep one-time verification codes strictly private, even if someone claims they were sent by mistake.',
  ],
  'General / Benign': [
    'No major scam indicators were triggered, though automated checks are not a guarantee of authenticity.',
    'Still double-check the sender address or phone number before sharing sensitive information or clicking links.',
  ],
};

export function generateRecommendations(
  riskLevel: RiskLevel,
  categories: ScamCategory[],
  hasUrls: boolean
): string[] {
  const recommendations: string[] = [];

  if (riskLevel === 'High Risk') {
    recommendations.push(
      'Treat this content as potentially fraudulent—do not click links, reply, or transfer funds.'
    );
  } else if (riskLevel === 'Suspicious') {
    recommendations.push(
      'Proceed with caution and verify the sender independently before taking any action.'
    );
  }

  for (const cat of categories) {
    const adviceList = CATEGORY_ADVICE[cat] || [];
    for (const item of adviceList) {
      if (!recommendations.includes(item)) {
        recommendations.push(item);
      }
    }
  }

  if (hasUrls && riskLevel !== 'Low Risk') {
    const urlTip =
      'Inspect the actual registrable domain (the part immediately before .com/.org/.xyz) rather than trusting brand names in subdomains.';
    if (!recommendations.includes(urlTip)) {
      recommendations.push(urlTip);
    }
  }

  return recommendations.slice(0, 6);
}
