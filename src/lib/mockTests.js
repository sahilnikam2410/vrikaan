// VRIKAAN Academy — Mock Test question bank + test definitions.
// India-first cyber-safety. Each question: { q, opts[], ans (index), why }.
// Tests pick questions by category. Keep `why` short — shown in review.

export const QUESTIONS = {
  upi: [
    { q: "You get a UPI 'collect request' for ₹5,000 from an unknown ID. Approving it will…", opts: ["Credit ₹5,000 to you", "Debit ₹5,000 from you", "Do nothing", "Verify your account"], ans: 1, why: "A collect/'requesting' UPI means they want YOUR money. Approving + PIN pays them." },
    { q: "When does entering your UPI PIN move money?", opts: ["Only when receiving", "Only when paying", "Both sending and receiving", "Never"], ans: 1, why: "UPI PIN is ONLY ever needed to PAY. You never enter a PIN to receive money." },
    { q: "A seller says 'scan this QR to RECEIVE your refund'. You should…", opts: ["Scan and enter PIN", "Scan only", "Refuse — QR is for paying", "Share your OTP"], ans: 2, why: "Scanning a QR + PIN PAYS money. QR codes are never needed to receive funds." },
    { q: "Before paying a new merchant on UPI, first check…", opts: ["Their profile photo", "The receiver NAME shown", "Their follower count", "Nothing"], ans: 1, why: "Confirm the receiver name UPI displays matches who you expect — scammers use look-alike names." },
    { q: "Safest way to test a large first-time UPI payment?", opts: ["Pay full amount", "Send ₹1 first", "Ask for discount", "Pay by QR"], ans: 1, why: "A ₹1 test confirms the receiver before committing a large amount." },
    { q: "Someone sends you ₹10,000 'by mistake' and asks you to refund it to a different number. You…", opts: ["Refund quickly", "Refuse — verify with your bank first", "Send to the new number", "Keep half"], ans: 1, why: "Classic mule/refund scam — the original credit is often fake or reversed. Verify with your bank; never forward." },
    { q: "An app asks to set up a UPI 'AutoPay mandate' you didn't request. This can…", opts: ["Earn cashback", "Silently debit you on a schedule", "Speed up payments", "Nothing"], ans: 1, why: "Mandates authorise recurring debits. Approve only mandates you started; cancel unknown ones in your UPI app." },
    { q: "A cashback offer says 'enter your UPI PIN to claim ₹500'. This will…", opts: ["Credit ₹500", "Debit you ₹500", "Verify identity", "Nothing"], ans: 1, why: "Receiving money never needs a PIN. Entering PIN here PAYS them — it's a debit, not cashback." },
    { q: "A 'bank' SMS links you to 'increase your UPI limit'. Best action?", opts: ["Tap the link", "Do it inside the official bank/UPI app", "Reply with details", "Forward to family"], ans: 1, why: "Limit changes are done inside the official app, never via SMS links — those harvest credentials." },
    { q: "You spot a UPI debit to an unknown handle you didn't authorise. First step?", opts: ["Ignore it", "Block + report in app and call 1930", "Wait a month", "Pay again"], ans: 1, why: "Act fast: dispute in the app, freeze if needed, and report to the 1930 cyber-fraud helpline." },
  ],
  phishing: [
    { q: "Biggest red flag in a 'Your account will be locked in 24 hours' SMS?", opts: ["It's polite", "Manufactured urgency", "It has your name", "It's from a long number"], ans: 1, why: "Urgency is the #1 phishing tactic — it pushes you to act before thinking." },
    { q: "An email link shows 'amaz0n.com'. This is…", opts: ["Official Amazon", "A typo, ignore", "A look-alike phishing domain", "Amazon India"], ans: 2, why: "Character swaps (0 for o) are classic look-alike domains. Type the real URL yourself." },
    { q: "Safest action on a suspicious bank email link?", opts: ["Click to check", "Open the official app directly", "Reply asking", "Forward to friends"], ans: 1, why: "Never click. Go to the bank's official app/site directly by typing the URL." },
    { q: "Which attachment is riskiest from an unknown sender?", opts: [".jpg photo", ".exe or .zip", ".txt note", "None are risky"], ans: 1, why: "Executables/archives can carry malware. Never open .exe/.zip from unknowns." },
    { q: "'Dear Customer' instead of your name in a bank email suggests…", opts: ["Premium service", "Bulk phishing blast", "A real bank", "Nothing"], ans: 1, why: "Generic greetings indicate a mass phishing send, not a personalised real message." },
    { q: "An SMS uses a shortened link (bit.ly/xyz) for an 'urgent KYC update'. You should…", opts: ["Tap to be safe", "Never tap — open the official app", "Reply STOP", "Share it"], ans: 1, why: "Shorteners hide the real destination. Banks don't KYC via SMS links — open the app directly." },
    { q: "A site shows the padlock/HTTPS. Does that mean it's safe/genuine?", opts: ["Yes, fully safe", "No — only that traffic is encrypted", "It's the real brand", "It can't be phishing"], ans: 1, why: "HTTPS only means encryption. Phishing sites get padlocks too — check the actual domain name." },
    { q: "An 'electricity bill — power cut tonight, pay now' SMS with a link is…", opts: ["A genuine warning", "A common phishing scam", "From the government", "Safe to pay"], ans: 1, why: "Fear + deadline + link = phishing. Verify dues only in the official electricity board app/site." },
    { q: "A delivery SMS: 'address incomplete, pay ₹25 to reschedule' + link. You…", opts: ["Pay the small fee", "Verify in the courier's official app", "Click and enter card", "Reply with OTP"], ans: 1, why: "Tiny 'fees' steal card/UPI data. Track parcels only via the courier's real app." },
    { q: "Best way to check where a link really goes before tapping (on mobile)?", opts: ["Just tap it", "Long-press to preview the URL", "Trust the text", "Screenshot it"], ans: 1, why: "Long-pressing reveals the true URL. Mismatched/odd domains = don't open." },
  ],
  vishing: [
    { q: "A caller claims to be your 'bank officer' and asks for your OTP. You should…", opts: ["Share it quickly", "Never share — hang up", "Share half", "Call them back on the number they gave"], ans: 1, why: "Banks NEVER ask for OTP/PIN/CVV. Hang up; call the official number on your card." },
    { q: "A 'police officer' on video call says you're in a 'digital arrest'. This is…", opts: ["Real, comply", "A scam — disconnect", "Normal procedure", "Only if uniformed"], ans: 1, why: "'Digital arrest' is not a real legal process — it's a fear scam. Disconnect and report." },
    { q: "Is it rude to hang up on a suspicious caller?", opts: ["Yes, very", "No — it's self-defence", "Only if elderly", "Always answer"], ans: 1, why: "Hanging up on a stranger is not impolite — it's basic self-defence." },
    { q: "Fake courier call says 'pay ₹2 to release your parcel' via a link. You…", opts: ["Pay, it's small", "Refuse — verify with courier directly", "Share card details", "Click the link"], ans: 1, why: "Tiny 'fees' harvest card/UPI credentials. Verify via the courier's official app." },
    { q: "Best way to verify a relative's 'emergency money' call (possible AI voice)?", opts: ["Send money fast", "Use a family safe-word / call back", "Trust the voice", "Ask their name"], ans: 1, why: "AI can clone voices. A pre-agreed safe-word or calling back confirms identity." },
    { q: "A recorded call says 'your number will be disconnected by TRAI in 2 hours, press 1'. This is…", opts: ["A real TRAI notice", "A scam — hang up", "From your operator", "Worth pressing 1"], ans: 1, why: "TRAI doesn't robo-call to disconnect numbers. Pressing 1 connects you to a scammer. Hang up." },
    { q: "A 'support agent' asks you to install AnyDesk/TeamViewer to 'fix' your issue. You…", opts: ["Install it", "Refuse — it gives them full control", "Install but watch", "Share the code only"], ans: 1, why: "Remote-access apps let scammers see your screen and drain accounts. Never install on a stranger's say-so." },
    { q: "You search Google for 'bank customer care' and call the top number. Risk?", opts: ["None", "It may be a planted fake-listing number", "Always official", "Faster service"], ans: 1, why: "Scammers plant fake helpline numbers in search/maps. Use the number on your card or the official app only." },
    { q: "Caller ID literally shows your bank's name. Can you trust the call?", opts: ["Yes, it's verified", "No — caller ID is easily spoofed", "Only if no accent", "Always"], ans: 1, why: "Caller ID and SMS sender IDs can be spoofed. Verify by calling back the official number yourself." },
    { q: "A call says you won ₹25 lakh in a 'KBC/lucky draw' — just pay 'processing fee'. This is…", opts: ["Real, pay up", "An advance-fee scam", "Tax you owe", "Worth a small risk"], ans: 1, why: "Any 'pay a fee to receive winnings' is an advance-fee scam. You never entered, you never won." },
  ],
  passwords: [
    { q: "Strongest password choice?", opts: ["Password123", "Your name + DOB", "A 16-char passphrase", "qwerty"], ans: 2, why: "Length beats complexity. A long random passphrase is far harder to crack." },
    { q: "Why enable 2FA / OTP-app on accounts?", opts: ["Looks cool", "Blocks login even if password leaks", "Faster login", "Not needed"], ans: 1, why: "2FA stops attackers even when your password is stolen in a breach." },
    { q: "Reusing one password across sites is risky because…", opts: ["It's slow", "One breach exposes all accounts", "Sites ban it", "No risk"], ans: 1, why: "Credential-stuffing: leaked password from one site is tried on all others." },
    { q: "Best place to store many strong passwords?", opts: ["A diary", "Browser sticky note", "A reputable password manager", "Same password everywhere"], ans: 2, why: "A password manager generates + stores unique strong passwords securely." },
    { q: "Most secure 2FA method?", opts: ["SMS OTP", "Authenticator app / hardware key", "Email OTP", "Security question"], ans: 1, why: "Authenticator apps/hardware keys resist SIM-swap + phishing better than SMS." },
    { q: "A passkey (fingerprint/face login) is safer than a password because…", opts: ["It's shorter", "It can't be phished or reused", "It's free", "It looks modern"], ans: 1, why: "Passkeys are tied to your device + can't be typed into a fake site, so phishing and reuse don't work." },
    { q: "Why is 'mother's maiden name' a weak security question?", opts: ["Too long", "Often public/guessable", "Hard to spell", "It isn't weak"], ans: 1, why: "Such answers are findable on social media or public records. Use random answers stored in a manager." },
    { q: "Best free way to check if your password leaked in a breach?", opts: ["Ask a friend", "haveibeenpwned.com / a breach checker", "Google your password", "You can't"], ans: 1, why: "Breach-checkers tell you if a password/email appeared in a leak so you can change it everywhere." },
    { q: "A 'support' call asks you to read out the OTP on your screen. You…", opts: ["Read it", "Never share — no genuine agent needs it", "Read half", "Type it in chat"], ans: 1, why: "No real agent ever needs your OTP. Reading it out hands them your account/payment." },
    { q: "Setting a strong lock-screen PIN/biometric on your phone matters because…", opts: ["It's stylish", "A stolen unlocked phone exposes UPI, OTPs, banking", "Saves battery", "Not needed"], ans: 1, why: "Your phone holds OTPs and payment apps — a weak/no lock lets a thief drain everything." },
  ],
  privacy: [
    { q: "Risk of posting your child's school-uniform photo publicly?", opts: ["None", "Reveals school + routine to strangers", "Better photos", "Faster upload"], ans: 1, why: "Uniforms + tags map a child's location/routine for strangers. Keep accounts private." },
    { q: "Location tags on photos can…", opts: ["Improve quality", "Reveal your home/movements", "Save battery", "Nothing"], ans: 1, why: "Geotags expose where you live and your patterns. Turn them off." },
    { q: "Safest social-media privacy setting for kids/teens?", opts: ["Public", "Friends-only / private", "Anyone can DM", "Location on"], ans: 1, why: "Private/friends-only limits who can see and contact them." },
    { q: "Anything you post online is…", opts: ["Easily deleted forever", "Potentially permanent (screenshots)", "Private by default", "Invisible"], ans: 1, why: "Screenshots make 'deleted' content permanent. Think before posting." },
    { q: "An app asks for access to Contacts, SMS and Photos to give a small loan. This is…", opts: ["Normal", "A major red flag — data for harassment", "Required by RBI", "Safe"], ans: 1, why: "Legit lenders don't need your contacts/SMS. Predatory apps harvest them to shame you later." },
    { q: "Doing banking on free public/airport Wi-Fi is risky because…", opts: ["It's slow", "Traffic can be intercepted", "It costs money", "No risk"], ans: 1, why: "Open Wi-Fi can be snooped. Use mobile data or a VPN for anything sensitive." },
    { q: "A random app requests 'Accessibility' permission. Why be cautious?", opts: ["It drains battery", "It can read your screen + tap for you", "It's just for fonts", "No reason"], ans: 1, why: "Accessibility lets an app see everything and act on your behalf — a favourite of banking-trojan scams." },
    { q: "Posting 'leaving for 10-day vacation 🎉' publicly can…", opts: ["Get likes", "Signal burglars your house is empty", "Improve reach", "Nothing"], ans: 1, why: "Public travel posts advertise an empty home. Share trips after you're back, with private accounts." },
    { q: "Forwarding an OTP that 'came by mistake' to a stranger who asks nicely…", opts: ["Is helpful", "Hands over access to YOUR account", "Is required", "Is harmless"], ans: 1, why: "That OTP is logging THEM into your account. Never forward OTPs to anyone, ever." },
    { q: "Granting a 'free' app permission to draw over other apps can enable…", opts: ["Dark mode", "Overlay attacks that steal taps/PINs", "Faster typing", "Nothing"], ans: 1, why: "Screen-overlay permission lets malware fake login screens over real apps. Grant it sparingly." },
  ],
  breach: [
    { q: "First thing to do after an account breach?", opts: ["Post about it", "Change passwords + enable 2FA", "Wait a week", "Delete the app"], ans: 1, why: "Immediately change passwords on affected accounts and turn on 2FA." },
    { q: "After financial data is exposed, you should…", opts: ["Ignore it", "Alert your bank + monitor statements", "Buy more", "Share details"], ans: 1, why: "Tell your bank, freeze/monitor cards, watch for unauthorised transactions." },
    { q: "Where to report cyber fraud in India?", opts: ["Nowhere", "cybercrime.gov.in / 1930 helpline", "Social media only", "The scammer"], ans: 1, why: "Report at cybercrime.gov.in or call the 1930 cyber-fraud helpline fast." },
    { q: "Why act within the first 24 hours of a breach?", opts: ["No reason", "Limits damage + improves money recovery", "Cheaper", "It doesn't matter"], ans: 1, why: "Fast action (block cards, file complaint) greatly improves recovery odds." },
    { q: "Your phone suddenly loses all network for hours for no reason. This could mean…", opts: ["Bad weather", "A SIM-swap attack in progress", "Low battery", "Nothing"], ans: 1, why: "Sudden loss of signal can mean someone ported/swapped your SIM to steal OTPs. Contact your operator immediately." },
    { q: "After a card is misused, the fastest block is…", opts: ["Email the bank", "Block in the bank app / call 1930", "Tweet them", "Wait for the statement"], ans: 1, why: "Block instantly in the app and report to 1930 — speed limits losses and aids recovery." },
    { q: "A scammer threatens to leak your private photos unless you pay (sextortion). You should…", opts: ["Pay quietly", "Don't pay — keep evidence + report to 1930/cybercrime.gov.in", "Argue with them", "Delete everything"], ans: 1, why: "Paying invites more demands. Stop contact, screenshot evidence, and report to the cyber-crime helpline." },
    { q: "If one leaked password was reused elsewhere, you must…", opts: ["Do nothing", "Change it on every site that used it", "Only change email", "Add a 1"], ans: 1, why: "Attackers try the leaked password everywhere (credential-stuffing). Change all reuses + enable 2FA." },
    { q: "When filing a cyber-fraud complaint, it helps to…", opts: ["Delete the chats", "Keep screenshots, numbers, transaction IDs", "Forget details", "Only call once"], ans: 1, why: "Evidence (screenshots, UPI refs, numbers) speeds investigation and fund recovery." },
    { q: "The national cyber-fraud financial helpline number in India is…", opts: ["100", "1930", "1098", "112"], ans: 1, why: "Call 1930 fast for money fraud — quick reporting can freeze the scammer's account before withdrawal." },
  ],

  loanApp: [
    { q: "An instant-loan app demands access to your full Contacts list. This is…", opts: ["Standard", "A predatory red flag", "Required by law", "For your safety"], ans: 1, why: "Genuine lenders never need your contacts. Predatory apps harvest them to harass/shame you on default." },
    { q: "Best way to check if a digital lender is legitimate in India?", opts: ["High ratings only", "Verify it's RBI-registered / tied to an NBFC/bank", "Big ad budget", "Nice logo"], ans: 1, why: "Only borrow from RBI-registered lenders or apps tied to a regulated bank/NBFC. Check the RBI list." },
    { q: "A loan app asks for an upfront 'processing/insurance fee' before disbursing. You…", opts: ["Pay it", "Walk away — legit loans deduct fees, not pre-charge", "Pay half", "Negotiate"], ans: 1, why: "Advance-fee demands before any loan arrives are a classic scam. Real fees are deducted from disbursal." },
    { q: "Loan-app agents threaten to message your contacts with morphed photos. You should…", opts: ["Pay to stop it", "Report to 1930/cybercrime.gov.in + keep evidence", "Argue", "Stay silent forever"], ans: 1, why: "This is criminal harassment. Don't pay; preserve evidence and report — paying never stops it." },
    { q: "A loan offer arrives by SMS/WhatsApp with 'no documents, instant cash'. This is…", opts: ["A great deal", "A high-risk scam lure", "From a bank", "Safe"], ans: 1, why: "'No KYC, instant, unsolicited' loans are bait for predatory/fake apps. Real credit needs verification." },
    { q: "Sideloading a loan APK from a link (not Play Store/App Store) is risky because…", opts: ["It's slower", "It can be malware/spyware", "It costs data", "No risk"], ans: 1, why: "Off-store APKs bypass review and often carry spyware. Install only from official app stores." },
    { q: "Interest shown as '1% per day' actually means…", opts: ["Cheap", "An extortionate ~365% per year", "Standard", "1% per year"], ans: 1, why: "Per-day rates hide brutal annual costs. Compare APR; such rates signal a loan-shark app." },
    { q: "Before installing a lending app, the safest check is…", opts: ["Star rating", "Read permissions + reviews about harassment", "Download count", "App colour"], ans: 1, why: "Excessive permissions and harassment complaints in reviews are the clearest warning signs." },
  ],

  jobScam: [
    { q: "A 'job' asks you to pay a registration/training fee upfront. This is…", opts: ["Normal hiring", "A job scam", "A good sign", "Refundable always"], ans: 1, why: "Legit employers pay you — they never charge you to get hired. Upfront fees = scam." },
    { q: "A WhatsApp/Telegram 'part-time job': 'like videos / rate hotels, earn ₹50 each, deposit to unlock more'. This is…", opts: ["Easy money", "A task/deposit scam", "Real freelancing", "Safe"], ans: 1, why: "Small early payouts build trust, then 'deposit to earn more' steals larger sums. Classic task scam." },
    { q: "You're offered a job you never applied for, with a high salary and instant joining. Be cautious because…", opts: ["You're lucky", "Unsolicited 'too-good' offers are common scams", "It's normal", "HR is fast"], ans: 1, why: "Unsolicited, high-pay, no-interview offers usually harvest fees or personal/bank data." },
    { q: "An 'offer letter' email is from gmail.com, not a company domain. This suggests…", opts: ["Startup style", "Likely fake", "Eco-friendly", "Nothing"], ans: 1, why: "Real companies use their own domain. Free-mail 'HR' plus fees/urgency points to a scam." },
    { q: "A recruiter asks for your bank login/OTP 'to set up salary'. You…", opts: ["Provide it", "Refuse — payroll never needs your OTP/login", "Give account number only is fine, login no", "Share OTP once"], ans: 1, why: "Salary setup needs only your account number/IFSC — never your login or OTP." },
    { q: "A 'work from home' role wants you to receive money in your account and forward it. This makes you…", opts: ["An employee", "A money mule (illegal)", "A manager", "Safe"], ans: 1, why: "Routing others' money through your account is money-muling for fraud — you become criminally liable." },
    { q: "Best way to verify a job offer is real?", opts: ["Trust the PDF", "Contact the company via its official website/HR", "Ask the recruiter", "Check the salary"], ans: 1, why: "Confirm independently through the company's official site/careers contact, not numbers in the offer." },
    { q: "An overseas job agent wants passport + fees over chat with no contract. Risk?", opts: ["None", "Trafficking/fraud risk — verify the agency", "Faster visa", "Standard"], ans: 1, why: "Use only registered recruiters; verify with the embassy/official portals. Upfront fees + no contract = danger." },
  ],

  social: [
    { q: "An attractive stranger online quickly professes love, then needs money for an 'emergency'. This is…", opts: ["True romance", "A romance scam", "Bad luck for them", "Normal"], ans: 1, why: "Fast intimacy + money request = romance scam. Never send money to someone you haven't met." },
    { q: "A new online 'friend' pushes a 'guaranteed crypto/forex investment' via an app. This is…", opts: ["A tip", "An investment ('pig-butchering') scam", "Generous", "Safe if small"], ans: 1, why: "They build trust then steer you to a fake trading app showing fake profits. You can't withdraw." },
    { q: "A 'friend' DMs from a hacked account asking for an urgent loan/OTP. You should…", opts: ["Send it", "Verify by calling them directly", "Reply with OTP", "Send half"], ans: 1, why: "Hacked accounts beg contacts for money/OTPs. Confirm via a separate call before doing anything." },
    { q: "Someone you just met online asks for intimate photos. Risk?", opts: ["None", "Sextortion — they may blackmail you", "It's flattering", "Safe if trusted"], ans: 1, why: "Such images are used for blackmail. Don't share; a stranger's 'trust me' is the setup." },
    { q: "A celebrity 'giveaway' asks you to send ₹1,000 to 'receive ₹10,000'. This is…", opts: ["Generous", "An advance-fee scam (often a fake/cloned account)", "Real PR", "Worth trying"], ans: 1, why: "Real giveaways never ask you to pay first. Verify-badge clones run these constantly." },
    { q: "Best response to a sextortion threat after a video call?", opts: ["Pay immediately", "Stop contact, don't pay, report to 1930/cybercrime.gov.in", "Send more", "Argue"], ans: 1, why: "Paying fuels more demands. Cut contact, keep evidence, and report — police handle these." },
    { q: "A QR code in a DM 'to receive your prize' should be…", opts: ["Scanned + PIN", "Ignored — QR+PIN pays them", "Trusted", "Shared"], ans: 1, why: "Receiving never needs a QR scan + PIN. That action sends YOUR money." },
    { q: "Accepting friend requests from unknown profiles can lead to…", opts: ["More fun", "Profile cloning + targeted scams", "Better reach", "Nothing"], ans: 1, why: "Strangers scrape your photos/info to clone you or target your contacts. Keep accounts private." },
  ],

  shopping: [
    { q: "A site sells the latest phone at 80% off, 'today only, pay by UPI'. This is…", opts: ["A steal", "Almost certainly a fake-shop scam", "Festival offer", "Safe"], ans: 1, why: "Too-good prices + pressure + direct UPI (no card protection) = fake store. If it's unreal, it's a trap." },
    { q: "On a marketplace (OLX etc.), a 'buyer' sends a QR to 'pay you' for your item. You…", opts: ["Scan + PIN to get paid", "Refuse — receiving never needs scan+PIN", "Share OTP", "Trust the soldier ID"], ans: 1, why: "The 'pay you' QR actually debits you. Sellers receive money without scanning anything." },
    { q: "Safer payment for an unknown online seller?", opts: ["Direct UPI/bank transfer", "Cash-on-delivery or card with dispute protection", "Gift cards", "Crypto"], ans: 1, why: "COD or card gives recourse. Direct transfers to strangers are unrecoverable if it's a scam." },
    { q: "A 'delivery agent' asks for an OTP to 'confirm' a COD parcel you didn't order. You…", opts: ["Give the OTP", "Refuse + don't accept unknown parcels", "Pay cash", "Share card"], ans: 1, why: "That OTP can authorise something else (return/refund fraud). Don't share or accept unexpected COD." },
    { q: "Ads on social media link to a shop with no address, no GST, only WhatsApp. This is…", opts: ["A small business", "A high-risk fake shop", "Trustworthy", "Required"], ans: 1, why: "No verifiable identity + chat-only orders is a hallmark of disappear-after-payment scams." },
    { q: "Best check before buying from a new website?", opts: ["Pretty design", "Reviews off-site, contact info, return policy, padlock+domain", "Low price", "Big banner"], ans: 1, why: "Verify independent reviews, real contact details, policies, and the exact domain — not just looks." },
    { q: "A 'refund' for a cancelled order asks you to install an app + enter card to 'receive' it. This is…", opts: ["Standard refund", "A refund scam", "Faster money", "Safe"], ans: 1, why: "Real refunds go back to your original payment automatically. Apps/cards-to-receive = theft." },
    { q: "Paying via UPI to a personal handle for an 'official store' purchase is risky because…", opts: ["It's slow", "No buyer protection if it's fraud", "It's taxed", "No risk"], ans: 1, why: "Personal-handle transfers have no dispute mechanism. Genuine stores use proper payment gateways." },
  ],

  deepfake: [
    { q: "You get a call in your son's exact voice begging for emergency money. Best move?", opts: ["Send at once", "Hang up and call him back on his real number", "Trust the voice", "Send half"], ans: 1, why: "AI clones voices from seconds of audio. Always verify via a callback or family safe-word before paying." },
    { q: "A video call shows your 'boss' ordering an urgent transfer. You should…", opts: ["Transfer immediately", "Verify on a known channel before paying", "Obey rank", "Reply on the call"], ans: 1, why: "Deepfake video/voice fakes executives ('CEO fraud'). Confirm large transfers out-of-band, every time." },
    { q: "The strongest defence against AI voice-clone scams in a family is…", opts: ["Caller ID", "A pre-agreed secret safe-word", "Trusting tone", "Speed"], ans: 1, why: "A safe-word only real family knows defeats a cloned voice instantly." },
    { q: "A deepfake video shows a celebrity promoting a 'doubling' investment app. This is…", opts: ["A real endorsement", "A fabricated scam ad", "Insider info", "Worth a small bet"], ans: 1, why: "Scammers deepfake celebrities/officials to sell fake investments. Guaranteed 'doubling' = fraud." },
    { q: "Signs a video/voice might be AI-generated include…", opts: ["Perfect always", "Odd blinking, lip-sync drift, robotic pauses, refusing to do a live action", "Background music", "Good lighting"], ans: 1, why: "Glitches in sync/expression and dodging a live request (e.g. 'turn your head') hint at a fake." },
    { q: "Can today's AI reliably clone a voice from a short social-media clip?", opts: ["No, impossible", "Yes — seconds of audio is enough", "Only studios can", "Only English"], ans: 1, why: "Modern tools clone convincing voices from very little audio — assume any public clip is usable." },
    { q: "If a deepfake of YOU is used to scam others, you should…", opts: ["Ignore it", "Report to the platform + 1930/cybercrime.gov.in, warn contacts", "Delete your account", "Pay to remove"], ans: 1, why: "Report fast, preserve links/evidence, and alert your contacts so they don't fall for it." },
    { q: "Why limit public posting of your kids' voices/videos?", opts: ["Storage", "It gives scammers cloning material", "Slow uploads", "No reason"], ans: 1, why: "Public audio/video can be scraped to clone voices for 'family emergency' scams. Keep accounts private." },
  ],
};

// Test definitions — each pulls from categories. timeSec = total timer.
export const TESTS = [
  { id: "fundamentals", title: "Cyber Safety Fundamentals", icon: "shield", desc: "A 10-question mix across UPI, phishing, scam calls, passwords and privacy. Start here.", timeSec: 300, pass: 70, pick: { upi: 2, phishing: 2, vishing: 2, passwords: 2, privacy: 1, breach: 1 } },
  { id: "upi-defender", title: "UPI Fraud Defender", icon: "banknote", desc: "Master payment-fraud defence: collect-requests, QR scams, look-alike IDs.", timeSec: 240, pass: 80, pick: { upi: 5, vishing: 2, breach: 1 } },
  { id: "phishing-pro", title: "Phishing & Scam-Call Pro", icon: "fish", desc: "Spot phishing emails, vishing calls, digital-arrest and courier scams.", timeSec: 240, pass: 80, pick: { phishing: 5, vishing: 3 } },
  { id: "account-armor", title: "Account Armor", icon: "lock", desc: "Passwords, 2FA, privacy and post-breach response — lock your accounts down.", timeSec: 240, pass: 80, pick: { passwords: 5, privacy: 3, breach: 2 } },
  { id: "loan-job-shield", title: "Loan & Job Scam Shield", icon: "briefcase", desc: "Predatory loan apps, fake job offers, task scams and money-mule traps.", timeSec: 240, pass: 80, pick: { loanApp: 5, jobScam: 5 } },
  { id: "shopping-safety", title: "Online Shopping Safety", icon: "shopping-cart", desc: "Fake shops, marketplace QR tricks, refund scams and safe payment habits.", timeSec: 240, pass: 80, pick: { shopping: 5, phishing: 2, upi: 3 } },
  { id: "deepfake-defense", title: "AI & Deepfake Defense", icon: "scan-face", desc: "Voice clones, deepfake video calls, CEO fraud and AI investment scams.", timeSec: 240, pass: 80, pick: { deepfake: 5, vishing: 3, social: 2 } },
  { id: "social-shield", title: "Social Media Shield", icon: "users", desc: "Romance scams, sextortion, hacked-friend pleas and profile cloning.", timeSec: 240, pass: 80, pick: { social: 5, privacy: 3, breach: 2 } },
  { id: "master-exam", title: "VRIKAAN Master Exam", icon: "award", desc: "The full 20-question gauntlet across every scam category. Earn your badge.", timeSec: 600, pass: 85, pick: { upi: 3, phishing: 2, vishing: 2, passwords: 2, loanApp: 2, jobScam: 2, social: 2, shopping: 2, deepfake: 2, breach: 1 } },
];

// Build a concrete question set for a test (shuffled).
export function buildTest(testId) {
  const t = TESTS.find((x) => x.id === testId);
  if (!t) return null;
  const out = [];
  for (const [cat, n] of Object.entries(t.pick)) {
    const pool = [...(QUESTIONS[cat] || [])];
    shuffle(pool);
    out.push(...pool.slice(0, n).map((q) => ({ ...q, cat })));
  }
  shuffle(out);
  return { ...t, questions: out, total: out.length };
}

// XP for a finished attempt: 5 per correct + 30 bonus on pass.
export function attemptXp(correct, total, passed) {
  return correct * 5 + (passed ? 30 : 0);
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── local best-score persistence (per test) ──
const KEY = "vrikaan_mock_results";
export function getMockResults() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
export function saveMockResult(testId, scorePct, xpGained) {
  const all = getMockResults();
  const prev = all[testId] || { best: 0, attempts: 0, xp: 0 };
  all[testId] = {
    best: Math.max(prev.best, scorePct),
    attempts: prev.attempts + 1,
    xp: prev.xp + xpGained,
    lastAt: Date.now(),
  };
  localStorage.setItem(KEY, JSON.stringify(all));
  return all[testId];
}
export function totalMockXp() {
  const all = getMockResults();
  return Object.values(all).reduce((s, r) => s + (r.xp || 0), 0);
}
