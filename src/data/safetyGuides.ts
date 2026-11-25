import { ScamCategory } from '../engine/types';

export interface ScamGuide {
  id: string;
  category: Exclude<ScamCategory, 'General / Benign'>;
  title: string;
  summary: string;
  howItWorks: string;
  redFlags: string[];
  prevention: string[];
  exampleSnippet: string;
}

export const SCAM_GUIDES: ScamGuide[] = [
  {
    id: 'banking-fraud',
    category: 'Banking Fraud',
    title: 'Fake Bank Alerts & Fraud Desk Scams',
    summary:
      'Attackers mimic your bank’s fraud department via SMS or email to claim an unauthorized charge or frozen debit card.',
    howItWorks:
      'Victims receive an alarming message claiming thousands were spent or their account will close within hours. A link or callback number connects to a spoofed portal or fake agent who collects login credentials and OTPs.',
    redFlags: [
      'Urgent 12-to-24 hour account closure threats',
      'Links using lookalike bank domains or ".xyz"/".top" extensions',
      'Requests to read back a 6-digit verification code to "cancel" a transfer',
    ],
    prevention: [
      'Close the message and open your bank’s official mobile app directly.',
      'Call only the customer service number printed on the back of your card.',
      'Never share one-time passcodes, even with someone claiming to be bank staff.',
    ],
    exampleSnippet:
      '"Chase Fraud Alert: $1,420 charge flagged. Verify within 24h to avoid closure: http://chase-verify-alert.xyz"',
  },
  {
    id: 'phishing',
    category: 'Phishing',
    title: 'Credential Harvesting & Lookalike Links',
    summary:
      'Deceptive links designed to capture passwords, 2FA tokens, or payment cards on pixel-accurate clones of trusted sites.',
    howItWorks:
      'Attackers register domains with subtle character swaps (like "paypa1" or "micros0ft") or hide brand names inside subdomains before an unrelated domain root.',
    redFlags: [
      'Brand name appears before another domain (e.g., apple.com.verify-id.top)',
      'Unencrypted HTTP links asking for login or billing updates',
      'URL shorteners masking the destination in unsolicited texts',
    ],
    prevention: [
      'Read URLs from right to left before the first "/" to find the true registrable domain.',
      'Use a password manager—it will not autofill credentials on lookalike domains.',
      'Prefer hardware keys or authenticator apps over SMS codes.',
    ],
    exampleSnippet: '"https://paypal.com.billing-update-center.xyz/signin"',
  },
  {
    id: 'delivery-scam',
    category: 'Delivery Scam',
    title: 'Parcel Redelivery & Customs Fee Smishing',
    summary:
      'Fake courier texts claiming a package cannot be delivered until you confirm your address and pay a small fee.',
    howItWorks:
      'Because most people are expecting an online order at any given time, a $1.99 redelivery fee feels harmless—until the payment form harvests your full card number and triggers unauthorized charges.',
    redFlags: [
      'Generic courier claims ("your parcel is held at warehouse") with no order details',
      'Requests for tiny card payments ($1–$3) to release a shipment',
      'Courier names paired with non-official TLDs (.top, .info, .icu)',
    ],
    prevention: [
      'Track packages only inside the retailer’s app or by typing the courier’s official URL.',
      'Ignore links in unexpected delivery texts.',
    ],
    exampleSnippet:
      '"USPS: Incomplete address. Pay $1.99 redelivery fee at usps-redelivery-fee.top"',
  },
  {
    id: 'fake-employment',
    category: 'Fake Employment',
    title: 'Task Scams & Fake Remote Job Offers',
    summary:
      'Unsolicited high-paying remote offers that move quickly to Telegram/WhatsApp or ask for upfront equipment payments.',
    howItWorks:
      'Scammers advertise $300–$800/day for simple data entry or app-rating tasks. Victims are eventually asked to deposit crypto to "unlock" commissions or deposit a fake check to buy supplies from a fake vendor.',
    redFlags: [
      'High daily pay promises with "no experience needed"',
      'Interviews conducted strictly over WhatsApp or Telegram text chat',
      'Checks emailed to you to purchase home-office equipment',
    ],
    prevention: [
      'Verify openings on the company’s official website and corporate email domain.',
      'Never pay money to earn wages or deposit emailed checks from strangers.',
    ],
    exampleSnippet:
      '"Earn $650 daily working from home! Message our HR manager on Telegram immediately."',
  },
  {
    id: 'investment-fraud',
    category: 'Investment Fraud',
    title: 'Guaranteed Returns & Crypto Trading Scams',
    summary:
      'Fraudulent investment groups promising risk-free profits, AI trading bots, or doubled cryptocurrency.',
    howItWorks:
      'Victims are invited into VIP chat groups showing fabricated profit dashboards. Once sizable funds are deposited, withdrawals are blocked behind endless "tax" or "liquidity" fees.',
    redFlags: [
      'Promises of "guaranteed" or "risk-free" returns',
      'Requests to connect wallets or send USDT/Bitcoin to unverified addresses',
      'Pressure to recruit friends or deposit more to unlock withdrawals',
    ],
    prevention: [
      'Treat any guarantee of high returns with zero risk as fraudulent.',
      'Verify broker licenses through official national financial registries.',
    ],
    exampleSnippet:
      '"Double your Bitcoin in 48 hours with our guaranteed AI trading bot!"',
  },
  {
    id: 'lottery-scam',
    category: 'Lottery Scam',
    title: 'Unsolicited Prize & Sweepstakes Claims',
    summary:
      'Messages claiming you won cash, electronics, or an inheritance—requiring a fee or gift card to release the payout.',
    howItWorks:
      'Attackers exploit excitement and urgency ("claim expires today") to collect advance fees, taxes, or banking info for a prize that does not exist.',
    redFlags: [
      'Winning a contest you never entered',
      'Requests to pay processing fees via gift cards or wire transfer',
      'Countdown timers or claims that your prize will go to another winner',
    ],
    prevention: [
      'Legitimate lotteries never ask winners to pay upfront fees to receive winnings.',
      'Do not reply—responding confirms your phone number is active.',
    ],
    exampleSnippet:
      '"Congratulations! You won $850,000! Pay a small processing fee via Apple gift card."',
  },
  {
    id: 'impersonation',
    category: 'Impersonation',
    title: 'Government, Toll & Tech Support Impersonation',
    summary:
      'Scammers posing as tax authorities, unpaid toll agencies, or Microsoft/Apple support to coerce payments or remote access.',
    howItWorks:
      'Using threats of arrest warrants, suspended licenses, or infected computers, impersonators pressure victims into calling a fake helpline and installing remote desktop software like AnyDesk.',
    redFlags: [
      'Threats of immediate arrest, lawsuits, or license suspension via SMS',
      'Unsolicited pop-ups or emails telling you to install AnyDesk or TeamViewer',
      'Demands for payment in gift cards, crypto, or wire transfers',
    ],
    prevention: [
      'Government agencies communicate formal notices by postal mail, not threatening texts.',
      'Never grant remote screen control to unsolicited callers.',
    ],
    exampleSnippet:
      '"IRS Final Notice: Arrest warrant issued. Call toll-free support and install AnyDesk."',
  },
  {
    id: 'social-engineering',
    category: 'Social Engineering',
    title: 'Psychological Manipulation & Secrecy Tactics',
    summary:
      'Tactics built around fear, panic, secrecy, and fake renewal invoices to override rational verification.',
    howItWorks:
      'Instead of relying purely on technical exploits, social engineers isolate the target ("do not tell branch staff", "do not call your bank") and force rapid decisions before anyone else can advise them.',
    redFlags: [
      'Instructions to keep the conversation secret from family or bank tellers',
      'Fake $499 auto-renewal invoices designed to make you call a refund desk',
      'Intimidation or extortion claims demanding Bitcoin within 48 hours',
    ],
    prevention: [
      'Pause whenever a message demands secrecy or immediate action.',
      'Talk through unexpected financial demands with a trusted friend or official institution.',
    ],
    exampleSnippet:
      '"Do not tell anyone or call your bank—keep this strictly confidential while we secure your funds."',
  },
];

export const SAFETY_PRINCIPLES = [
  {
    number: '01',
    title: 'Verify Out-of-Band',
    description:
      'Never use the phone number or link inside a suspicious message. Look up the organization independently via your bookmarks, banking app, or card back.',
  },
  {
    number: '02',
    title: 'Inspect the True Domain',
    description:
      'In "paypal.com.verify-login.xyz", the actual owner is "verify-login.xyz"—not PayPal. Always check the segment immediately before the first single slash.',
  },
  {
    number: '03',
    title: 'Guard One-Time Passcodes',
    description:
      'OTPs authorize logins and money transfers. No legitimate support agent or fraud specialist needs you to read back an OTP to "cancel" a charge.',
  },
  {
    number: '04',
    title: 'Reject Irreversible Payments',
    description:
      'Gift cards, cryptocurrency transfers, and wire payments cannot be reversed once sent. Any government, job, or prize demand using them is a scam.',
  },
];
