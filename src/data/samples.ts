import { ScanType } from '../engine/types';

export interface SampleCase {
  id: string;
  label: string;
  type: ScanType;
  categoryHint: string;
  content: string;
}

export const SAMPLE_MESSAGES: SampleCase[] = [
  {
    id: 'sample-legit-otp',
    label: 'Legitimate Bank OTP Alert',
    type: 'message',
    categoryHint: 'Legitimate · Expected Low Risk',
    content:
      'Chase: Your one-time verification code is 482910. Chase will never call or text you asking for this code. Do not share this code with anyone. If you did not request this, please ignore.',
  },
  {
    id: 'sample-legit-friend',
    label: 'Legitimate Casual Payment Text',
    type: 'message',
    categoryHint: 'Legitimate · Expected Low Risk',
    content:
      'Hey Alex, thanks for paying me back for dinner last night! Let me know if you want to grab coffee next Tuesday around 2pm.',
  },
  {
    id: 'sample-bank-alert',
    label: 'Fake Bank Suspension Alert',
    type: 'message',
    categoryHint: 'Banking Fraud · Expected High Risk',
    content:
      'URGENT: Chase Fraud Department detected an unauthorized transaction of $1,420.00. Your debit card has been suspended. Verify your account immediately within 24 hours to avoid permanent closure: http://chase.security-verify-alert.xyz/login',
  },
  {
    id: 'sample-otp-phish',
    label: 'OTP Phishing & Social Engineering',
    type: 'message',
    categoryHint: 'Phishing · Expected High Risk',
    content:
      'Bank of America Security Alert: An unauthorized wire of $950 is pending. Reply with the 6-digit verification code sent to your phone to cancel the transaction. Do not call the bank while we process this reversal.',
  },
  {
    id: 'sample-delivery',
    label: 'Fake Parcel Delivery Fee',
    type: 'message',
    categoryHint: 'Delivery Scam · Expected High Risk',
    content:
      'USPS Notice: Your package is held at the warehouse due to an incomplete shipping address. Pay a small redelivery fee of $1.99 and update your delivery address within 12 hours: https://usps-redelivery-fee.top/track',
  },
  {
    id: 'sample-lottery',
    label: 'Lottery & Prize Claim Scam',
    type: 'message',
    categoryHint: 'Lottery Scam · Expected High Risk',
    content:
      'CONGRATULATIONS! You have won $850,000.00 in the International Sweepstakes Draw! Click here immediately to claim your cash prize and pay a small processing fee via Apple gift card: http://claim-prize-winner.vip/redeem',
  },
  {
    id: 'sample-job',
    label: 'Fake Remote Job Offer',
    type: 'message',
    categoryHint: 'Fake Employment · Expected High Risk',
    content:
      'Hello! We are hiring for a part-time remote data entry job. Earn $650 daily with no experience needed! Message our HR manager on Telegram immediately and deposit this check to buy supplies for your home office.',
  },
  {
    id: 'sample-investment',
    label: 'Crypto Investment & ROI Scam',
    type: 'message',
    categoryHint: 'Investment Fraud · Expected High Risk',
    content:
      'Exclusive VIP trading group! Join our AI trading bot and double your Bitcoin in 48 hours with guaranteed returns and risk-free profit. Send USDT via crypto wallet or visit https://coinbaze-vip-profit.icu/wallet-connect to withdraw your profits.',
  },
];

export const SAMPLE_URLS: SampleCase[] = [
  {
    id: 'url-safe-paypal',
    label: 'Official PayPal HTTPS URL',
    type: 'url',
    categoryHint: 'Official Domain · Expected Low Risk',
    content: 'https://www.paypal.com/signin',
  },
  {
    id: 'url-safe-irs',
    label: 'Official IRS Government Portal',
    type: 'url',
    categoryHint: 'Official Domain · Expected Low Risk',
    content: 'https://www.irs.gov/refunds',
  },
  {
    id: 'url-lookalike-subdomain',
    label: 'Brand-in-Subdomain Phishing URL',
    type: 'url',
    categoryHint: 'Phishing · Expected High Risk',
    content: 'http://paypal.com.account-verify-alert.xyz/login?otp=required',
  },
  {
    id: 'url-ip-address',
    label: 'Raw IP Address Login Portal',
    type: 'url',
    categoryHint: 'Phishing · Expected High Risk',
    content: 'http://192.168.45.12:8080/chase/verify-pin',
  },
  {
    id: 'url-shortener',
    label: 'Obfuscated URL Shortener',
    type: 'url',
    categoryHint: 'Suspicious · Expected Suspicious',
    content: 'https://bit.ly/3xYzParcelConfirm',
  },
  {
    id: 'url-at-trick',
    label: 'Embedded "@" Credential Trick',
    type: 'url',
    categoryHint: 'Phishing · Expected High Risk',
    content: 'https://chase.com@secure-login-update.top/confirm',
  },
];
