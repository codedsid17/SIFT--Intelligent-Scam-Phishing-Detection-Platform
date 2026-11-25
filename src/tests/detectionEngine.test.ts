import assert from 'node:assert/strict';
import test from 'node:test';
import {
  analyzeMessage,
  analyzeUrl,
  validateScanInput,
} from '../engine/detectionEngine';

test('1. Normal benign messages score Low Risk (0-29)', () => {
  const result = analyzeMessage(
    'Hey Jordan, thanks for sending over the meeting notes! Want to grab coffee tomorrow at 10am?'
  );
  assert.equal(result.riskLevel, 'Low Risk');
  assert.ok(result.riskScore < 30, `Expected < 30, got ${result.riskScore}`);
  assert.equal(result.primaryCategory, 'General / Benign');
});

test('2. False-positive scenarios: Legitimate OTP with anti-sharing notice and isolated bank/payment mentions score Low Risk', () => {
  const legitOtp = analyzeMessage(
    'Chase: Your one-time verification code is 482910. Chase will never call or text you asking for this code. Do not share this code with anyone. If you did not request this, please ignore.'
  );
  assert.equal(legitOtp.riskLevel, 'Low Risk');
  assert.ok(legitOtp.riskScore < 30, `Legit OTP scored ${legitOtp.riskScore}`);

  const legitPaymentMention = analyzeMessage(
    'Hi team, thank you for your payment on invoice #402. Let me know if you need the bank receipt attached.'
  );
  assert.equal(legitPaymentMention.riskLevel, 'Low Risk');
  assert.ok(
    legitPaymentMention.riskScore < 30,
    `Legit payment mention scored ${legitPaymentMention.riskScore}`
  );
});

test('3. Suspicious bank impersonation messages score High Risk', () => {
  const result = analyzeMessage(
    'URGENT: Chase Fraud Department detected an unauthorized transaction of $1,420. Your account will be suspended within 24 hours. Verify your account immediately: http://chase.security-verify-alert.xyz/login'
  );
  assert.equal(result.riskLevel, 'High Risk');
  assert.ok(result.riskScore >= 60, `Expected >= 60, got ${result.riskScore}`);
  assert.ok(
    result.detectedCategories.includes('Banking Fraud') ||
      result.detectedCategories.includes('Phishing')
  );
  assert.ok(result.extractedUrls.length === 1);
});

test('4. OTP phishing attempt scores High Risk', () => {
  const result = analyzeMessage(
    'Bank of America Security Alert: An unauthorized wire of $950 is pending. Reply with the 6-digit verification code sent to your phone to cancel the transaction. Do not call the bank while we process this.'
  );
  assert.equal(result.riskLevel, 'High Risk');
  assert.ok(result.riskScore >= 60, `Expected >= 60, got ${result.riskScore}`);
  assert.ok(result.indicators.some((i) => i.ruleId === 'KW_OTP_HARVEST'));
});

test('5. Fake delivery messages score High Risk', () => {
  const result = analyzeMessage(
    'USPS Notice: Your package is held at the warehouse due to an incomplete shipping address. Pay a small redelivery fee of $1.99 within 12 hours: https://usps-redelivery-fee.top/track'
  );
  assert.equal(result.riskLevel, 'High Risk');
  assert.ok(result.riskScore >= 60, `Expected >= 60, got ${result.riskScore}`);
  assert.ok(result.detectedCategories.includes('Delivery Scam'));
});

test('6. Lottery scams score High Risk', () => {
  const result = analyzeMessage(
    'Congratulations! You have won $850,000 in the Mega Millions Sweepstakes! Claim your cash prize immediately and pay a small processing fee via Apple gift card.'
  );
  assert.equal(result.riskLevel, 'High Risk');
  assert.ok(result.riskScore >= 60, `Expected >= 60, got ${result.riskScore}`);
  assert.equal(result.primaryCategory, 'Lottery Scam');
});

test('7. Fake employment offers score High Risk', () => {
  const result = analyzeMessage(
    'Part-time remote data entry job! Earn $650 daily with no experience needed. Message our HR manager on Telegram and deposit this check to buy supplies.'
  );
  assert.equal(result.riskLevel, 'High Risk');
  assert.ok(result.riskScore >= 60, `Expected >= 60, got ${result.riskScore}`);
  assert.equal(result.primaryCategory, 'Fake Employment');
});

test('8. Suspicious URLs (IP, @ trick, brand subdomain, shortener) are flagged accurately', () => {
  const ipUrl = analyzeUrl('http://192.168.1.50:8080/chase/login');
  assert.equal(ipUrl.riskLevel, 'High Risk');
  assert.ok(ipUrl.indicators.some((i) => i.ruleId === 'URL_IP_ADDRESS'));

  const brandSubUrl = analyzeUrl('http://paypal.com.verify-login-alert.xyz/confirm');
  assert.equal(brandSubUrl.riskLevel, 'High Risk');
  assert.ok(brandSubUrl.indicators.some((i) => i.ruleId === 'URL_BRAND_SUBDOMAIN'));

  const atTrickUrl = analyzeUrl('https://chase.com@evil-phish.top/signin');
  assert.equal(atTrickUrl.riskLevel, 'High Risk');
  assert.ok(atTrickUrl.indicators.some((i) => i.ruleId === 'URL_AT_OBFUSCATION'));

  const shortenerUrl = analyzeUrl('https://bit.ly/3xYzParcel');
  assert.ok(shortenerUrl.riskScore >= 25);
});

test('9. Safe official HTTPS URLs score Low Risk', () => {
  const paypalOfficial = analyzeUrl('https://www.paypal.com/signin');
  assert.equal(paypalOfficial.riskLevel, 'Low Risk');
  assert.ok(paypalOfficial.riskScore < 30, `Safe PayPal URL scored ${paypalOfficial.riskScore}`);

  const irsOfficial = analyzeUrl('https://www.irs.gov/refunds');
  assert.equal(irsOfficial.riskLevel, 'Low Risk');
  assert.ok(irsOfficial.riskScore < 30, `Safe IRS URL scored ${irsOfficial.riskScore}`);
});

test('10. Empty input and invalid URL validation behave consistently', () => {
  const emptyMsg = validateScanInput('   ', 'message');
  assert.equal(emptyMsg.valid, false);
  assert.ok(emptyMsg.error);

  const emptyUrl = validateScanInput('', 'url');
  assert.equal(emptyUrl.valid, false);
  assert.ok(emptyUrl.error);

  assert.throws(() => analyzeMessage('   '));
  assert.throws(() => analyzeUrl('not a valid url'));
});
