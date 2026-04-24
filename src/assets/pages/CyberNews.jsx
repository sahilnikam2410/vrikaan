import { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const T = { bg: "#030712", dark: "#0a0f1e", white: "#f1f5f9", muted: "#94a3b8", accent: "#6366f1", cyan: "#14e3c5", green: "#22c55e", red: "#ef4444", border: "rgba(148,163,184,0.08)", card: "rgba(17,24,39,0.6)", surface: "#111827", gold: "#eab308", orange: "#f97316", purple: "#a78bfa", blue: "#38bdf8", pink: "#ec4899" };

const severityColors = { Critical: T.red, High: T.orange, Medium: T.gold, Low: T.green };
const severityBg = { Critical: "rgba(239,68,68,0.12)", High: "rgba(249,115,22,0.12)", Medium: "rgba(234,179,8,0.12)", Low: "rgba(34,197,94,0.12)" };

const categoryColors = { Ransomware: T.red, "Data Breach": T.orange, Vulnerability: T.gold, Malware: T.pink, Privacy: T.purple, "AI Security": T.cyan, "Nation State": T.blue, "Zero Day": T.red, "Supply Chain": T.orange, Phishing: T.green, "Cloud Security": T.accent, Regulation: T.muted };

const sources = ["TechCrunch", "BleepingComputer", "Krebs on Security", "The Hacker News", "Dark Reading", "Wired", "Ars Technica", "SecurityWeek", "Threatpost", "CyberScoop"];

const newsArticles = [
  {
    id: 1, title: "Critical Zero-Day in Linux Kernel Exploited by Nation-State Actors", source: "Krebs on Security", date: "Mar 28, 2026", category: "Zero Day", severity: "Critical", readTime: "6 min",
    summary: "A previously unknown vulnerability in the Linux kernel's netfilter subsystem is being actively exploited by suspected Chinese APT groups. CISA has issued an emergency directive requiring all federal agencies to patch within 48 hours.",
    fullContent: "Security researchers at CrowdStrike have identified active exploitation of CVE-2026-1847, a critical use-after-free vulnerability in the Linux kernel's netfilter component. The flaw allows local privilege escalation to root, and when chained with a separate remote code execution bug in OpenSSH, enables full remote takeover of affected systems.\n\nThe attacks have been attributed to a cluster tracked as 'Volt Typhoon 2.0,' a suspected Chinese state-sponsored threat actor. Targets include US defense contractors, telecommunications providers, and critical infrastructure operators. The group has been observed deploying a novel rootkit dubbed 'ShadowFilter' that hooks into the kernel's network stack to intercept and exfiltrate sensitive data while remaining virtually invisible to standard detection tools.\n\nCISA's emergency directive BOD 26-02 mandates federal civilian agencies apply the patch released by the Linux kernel maintainers within 48 hours. Private sector organizations are strongly urged to do the same. The vulnerability affects kernel versions 5.15 through 6.8. Mitigations include disabling netfilter modules where not required and implementing strict network segmentation.",
    breaking: true
  },
  {
    id: 2, title: "Massive Data Breach Exposes 340 Million Records from Healthcare Platform", source: "BleepingComputer", date: "Mar 27, 2026", category: "Data Breach", severity: "Critical", readTime: "5 min",
    summary: "MedVault, a popular healthcare data management platform, has confirmed a breach affecting 340 million patient records across 12 countries. Exposed data includes SSNs, medical histories, and insurance details.",
    fullContent: "Healthcare data platform MedVault disclosed a massive breach on Thursday after a threat actor posted sample data on a dark web forum. The breach, which occurred between January and February 2026, exposed 340 million records containing names, Social Security numbers, medical diagnoses, prescription histories, and insurance policy details.\n\nThe attackers exploited a misconfigured API endpoint that lacked proper authentication, allowing direct access to the backend database. The breach was discovered when security researchers identified the data for sale on BreachForums for $500,000 in cryptocurrency.\n\nMedVault has engaged Mandiant for incident response and is offering two years of identity protection services to affected individuals. Multiple class-action lawsuits have already been filed, and the HHS Office for Civil Rights has opened a formal investigation into potential HIPAA violations. This marks the largest healthcare data breach since the Change Healthcare incident."
  },
  {
    id: 3, title: "LockBit 4.0 Ransomware Variant Bypasses All Major EDR Solutions", source: "Dark Reading", date: "Mar 27, 2026", category: "Ransomware", severity: "Critical", readTime: "7 min",
    summary: "A new variant of the LockBit ransomware has been observed bypassing endpoint detection from CrowdStrike, SentinelOne, and Microsoft Defender using a novel kernel-level evasion technique.",
    fullContent: "The LockBit ransomware group has released version 4.0 of their encryption tool, featuring an unprecedented kernel-level evasion engine that researchers are calling 'GhostDriver.' The technique abuses a legitimate signed Windows driver to disable EDR kernel callbacks before the ransomware payload executes.\n\nSophos X-Ops researchers, who first identified the variant in a live incident response engagement, confirmed that the ransomware successfully bypassed CrowdStrike Falcon, SentinelOne Singularity, and Microsoft Defender for Endpoint in their default configurations. The attack chain begins with a phishing email containing a malicious OneNote attachment that drops a loader executable.\n\nAll three EDR vendors have pushed emergency signature updates and are developing behavioral detections. CrowdStrike released a blog post acknowledging the bypass and recommending customers enable 'aggressive mode' monitoring. SentinelOne has issued a hotfix. Organizations are advised to implement application whitelisting and monitor for unusual driver loading activity as interim mitigations."
  },
  {
    id: 4, title: "Google Patches Actively Exploited Chrome Zero-Day Affecting 3 Billion Users", source: "The Hacker News", date: "Mar 26, 2026", category: "Vulnerability", severity: "High", readTime: "4 min",
    summary: "Google has released an emergency update for Chrome to fix a type confusion vulnerability in the V8 JavaScript engine that was being used in targeted attacks against journalists and activists.",
    fullContent: "Google released Chrome version 124.0.6367.118 on Wednesday to address CVE-2026-2103, a type confusion vulnerability in the V8 JavaScript engine rated as high severity. The company acknowledged that an exploit for the vulnerability exists in the wild.\n\nThe flaw was reported by researchers at Citizen Lab, who discovered it being used in a targeted espionage campaign against journalists covering political dissidents. The exploit was delivered through watering hole attacks on news websites, requiring no user interaction beyond visiting the compromised page.\n\nThis marks the fourth Chrome zero-day patched in 2026 so far. Users are strongly encouraged to update immediately by navigating to chrome://settings/help. Enterprise administrators should push the update through their management consoles. Other Chromium-based browsers including Edge, Brave, and Opera are also affected and are expected to release patches shortly."
  },
  {
    id: 5, title: "AI-Generated Deepfake Phishing Campaign Targets Fortune 500 Executives", source: "TechCrunch", date: "Mar 26, 2026", category: "AI Security", severity: "High", readTime: "6 min",
    summary: "A sophisticated phishing campaign using AI-generated video calls of CEOs and CFOs has defrauded at least 8 Fortune 500 companies out of a combined $47 million in fraudulent wire transfers.",
    fullContent: "The FBI has issued an urgent advisory warning of a coordinated deepfake phishing campaign targeting senior executives at major corporations. At least eight Fortune 500 companies have confirmed falling victim, with total losses exceeding $47 million.\n\nThe attackers use publicly available video footage and earnings call audio to create convincing real-time deepfakes of company executives. Victims report receiving video calls that appeared to come from their CEO or CFO, requesting urgent wire transfers for confidential acquisitions. The deepfakes were sophisticated enough to maintain natural conversation and respond to questions in real-time.\n\nThe FBI believes the campaign is operated by a single group with significant AI expertise and resources. Companies are advised to implement out-of-band verification for all financial transactions above a set threshold, using pre-established code words or callback procedures. Several cybersecurity firms have announced accelerated development of deepfake detection tools for video conferencing platforms."
  },
  {
    id: 6, title: "Supply Chain Attack on Popular NPM Package Affects 15,000 Applications", source: "BleepingComputer", date: "Mar 25, 2026", category: "Supply Chain", severity: "High", readTime: "5 min",
    summary: "A malicious update to the widely-used 'event-stream-utils' NPM package injected cryptocurrency-stealing code into thousands of applications. The package maintainer's account was compromised via credential stuffing.",
    fullContent: "A supply chain attack targeting the popular NPM package 'event-stream-utils' has been discovered after users reported unauthorized cryptocurrency transactions. The package, downloaded over 2 million times per week, received a malicious update (v3.4.7) that included obfuscated code designed to steal cryptocurrency wallet credentials.\n\nThe attack was traced to a compromise of the package maintainer's NPM account through credential stuffing using passwords leaked in a previous breach. The attacker published the malicious version on March 22, and it was downloaded approximately 350,000 times before detection on March 25.\n\nNPM has reverted the package to the last known-good version and revoked the compromised credentials. GitHub's security team is conducting a broader audit of packages maintained by the affected account. Organizations are advised to pin dependency versions, use lockfiles, and implement software composition analysis tools that can detect suspicious code changes in dependencies."
  },
  {
    id: 7, title: "European Union Passes Landmark AI Cybersecurity Regulation", source: "Wired", date: "Mar 25, 2026", category: "Regulation", severity: "Medium", readTime: "5 min",
    summary: "The EU has approved the AI Cybersecurity Act, requiring all AI systems deployed in critical infrastructure to undergo mandatory security audits and maintain real-time threat monitoring capabilities.",
    fullContent: "The European Parliament voted overwhelmingly to approve the AI Cybersecurity Act (AICA), establishing the world's first comprehensive regulatory framework specifically addressing the security of artificial intelligence systems used in critical infrastructure and public services.\n\nThe legislation requires organizations deploying AI in sectors including healthcare, finance, energy, and transportation to conduct annual third-party security audits of their AI models, implement continuous monitoring for adversarial attacks, maintain human oversight capabilities, and report AI-related security incidents within 24 hours.\n\nCompanies face fines of up to 4% of global annual revenue for non-compliance, mirroring the GDPR enforcement model. The regulation takes effect in 18 months, giving organizations time to implement required controls. US tech companies have expressed concerns about compliance costs, while cybersecurity firms see significant market opportunities in AI security auditing and monitoring services."
  },
  {
    id: 8, title: "Cl0p Ransomware Gang Exploits New MOVEit-Style File Transfer Vulnerability", source: "Krebs on Security", date: "Mar 24, 2026", category: "Ransomware", severity: "Critical", readTime: "6 min",
    summary: "The Cl0p ransomware group is mass-exploiting a critical SQL injection flaw in SecureTransfer Pro, a widely-used enterprise file transfer solution. Over 2,000 organizations are believed to be compromised.",
    fullContent: "In a chilling replay of the 2023 MOVEit attacks, the Cl0p ransomware gang has begun mass-exploiting a critical SQL injection vulnerability (CVE-2026-0912) in SecureTransfer Pro, an enterprise managed file transfer platform used by approximately 8,000 organizations worldwide.\n\nThe vulnerability allows unauthenticated attackers to access the application's database and execute arbitrary commands on the underlying server. Cl0p has been observed deploying webshells on compromised systems and exfiltrating data before deploying ransomware, following their established double-extortion playbook.\n\nSecureTransfer Pro's vendor released an emergency patch on March 23, but researchers estimate that over 2,000 organizations had already been compromised by the time the patch was available. Cl0p has begun posting victim names on their leak site, with a 7-day deadline for ransom negotiations. CISA has added the vulnerability to its Known Exploited Vulnerabilities catalog and issued a joint advisory with the FBI recommending immediate patching and forensic investigation of all SecureTransfer Pro instances."
  },
  {
    id: 9, title: "Microsoft Recalls AI Feature After Researchers Demonstrate Data Exfiltration Risk", source: "Ars Technica", date: "Mar 24, 2026", category: "AI Security", severity: "High", readTime: "5 min",
    summary: "Microsoft has disabled its Copilot Memory feature after security researchers demonstrated how prompt injection attacks could extract sensitive corporate data through the AI assistant's persistent memory.",
    fullContent: "Microsoft announced it is temporarily disabling the Copilot Memory feature in Microsoft 365 after researchers at ETH Zurich published a paper demonstrating critical security flaws. The feature, which allows Copilot to remember context across sessions, was shown to be vulnerable to indirect prompt injection attacks.\n\nThe researchers demonstrated that a malicious document shared via Teams or email could inject hidden instructions into Copilot's memory, causing it to gradually exfiltrate sensitive information from subsequent conversations. The attack was particularly insidious because it persisted across sessions, meaning a single malicious interaction could compromise weeks of subsequent Copilot usage.\n\nMicrosoft stated the feature will remain disabled until additional safeguards are implemented, expected within 4-6 weeks. The incident has reignited debate about the security implications of integrating AI assistants deeply into enterprise workflows, with several CISOs publicly questioning whether the productivity gains justify the expanded attack surface."
  },
  {
    id: 10, title: "Russian Hackers Target NATO Alliance Member Power Grids", source: "CyberScoop", date: "Mar 23, 2026", category: "Nation State", severity: "Critical", readTime: "7 min",
    summary: "Sandworm, a Russian military intelligence-linked hacking group, has been caught infiltrating power grid control systems in three NATO countries. The attacks used a new ICS-specific malware framework.",
    fullContent: "A joint investigation by the NSA, GCHQ, and ANSSI has uncovered a coordinated campaign by Sandworm (also tracked as Voodoo Bear) targeting industrial control systems managing electrical power distribution in Poland, Romania, and the Baltic states.\n\nThe attackers deployed a previously unknown ICS malware framework dubbed 'BlackEnergy3' — an evolution of the tool used in the 2015 Ukraine power grid attacks. The malware is designed to interact with Siemens SIPROTEC and ABB Relion protective relays, potentially enabling the attackers to cause physical damage to grid infrastructure or trigger cascading blackouts.\n\nThe campaign was detected before any disruption occurred, thanks to anomaly detection systems deployed as part of a NATO cyber defense initiative. The affected utilities have isolated compromised systems and are working with national CERTs to remediate. The incident has accelerated discussions about NATO's collective cyber defense posture and the application of Article 5 to significant cyber attacks against member states."
  },
  {
    id: 11, title: "Critical Vulnerability Found in UEFI Secure Boot Affecting Most PCs", source: "SecurityWeek", date: "Mar 23, 2026", category: "Vulnerability", severity: "High", readTime: "5 min",
    summary: "A flaw in the UEFI reference implementation used by most PC manufacturers allows attackers to bypass Secure Boot and install persistent bootkits that survive OS reinstallation.",
    fullContent: "Researchers at Eclypsium have disclosed a critical vulnerability in the UEFI reference implementation maintained by the Tianocore project, which forms the basis of firmware used by virtually all major PC manufacturers including Dell, HP, Lenovo, and ASUS.\n\nThe vulnerability, tracked as CVE-2026-1553, allows a local attacker with administrator privileges to bypass Secure Boot protections and install a bootkit — malware that loads before the operating system and is invisible to security software. The bootkit persists even through complete OS reinstallation and disk formatting, as it resides in the system's SPI flash memory.\n\nFirmware updates are being released by manufacturers on a rolling basis, but the update process requires careful coordination to avoid bricking systems. Eclypsium estimates that full remediation across the global PC fleet will take 6-12 months. In the interim, organizations should monitor for unauthorized firmware modifications using tools like CHIPSEC and restrict local administrator access."
  },
  {
    id: 12, title: "Telegram Becomes Primary Platform for Cybercrime Marketplaces", source: "Dark Reading", date: "Mar 22, 2026", category: "Data Breach", severity: "Medium", readTime: "4 min",
    summary: "A new report from Flashpoint reveals that Telegram has surpassed traditional dark web forums as the primary marketplace for stolen credentials, malware, and hacking services.",
    fullContent: "Threat intelligence firm Flashpoint has published its quarterly cybercrime ecosystem report, revealing a significant shift in where cybercriminals conduct business. Telegram channels and groups now account for 63% of all cybercrime marketplace activity, up from 41% a year ago.\n\nThe migration from traditional dark web forums to Telegram is driven by ease of use, reliable uptime, end-to-end encryption in private chats, and a large existing user base. Researchers identified over 1,400 active Telegram channels selling stolen credentials, initial access to corporate networks, malware-as-a-service subscriptions, and DDoS-for-hire services.\n\nDespite Telegram's recent cooperation with law enforcement in some jurisdictions, the platform's massive scale makes comprehensive moderation effectively impossible. Security teams are advised to include Telegram monitoring in their threat intelligence programs. Several commercial threat intelligence platforms have added Telegram channel monitoring capabilities in response to this trend."
  },
  {
    id: 13, title: "AWS S3 Bucket Misconfiguration Leaks Pentagon Contractor Documents", source: "TechCrunch", date: "Mar 22, 2026", category: "Cloud Security", severity: "High", readTime: "4 min",
    summary: "Classified and sensitive documents from a Pentagon defense contractor were exposed through a misconfigured AWS S3 bucket for an estimated 3 weeks before discovery by security researchers.",
    fullContent: "Security researcher Chris Vickery discovered a publicly accessible AWS S3 bucket belonging to Northstar Defense Systems, a Pentagon contractor specializing in satellite communications. The bucket contained approximately 1.8TB of data including network diagrams, vulnerability assessments, personnel records, and documents marked as classified.\n\nThe exposure was caused by an IAM policy change during a cloud migration project that inadvertently removed access restrictions from the storage bucket. The misconfiguration went undetected for approximately three weeks before Vickery's discovery and responsible disclosure.\n\nThe Department of Defense has launched an investigation, and Northstar's security clearance is under review. The incident highlights the persistent challenge of cloud security configuration management, particularly during migration projects. AWS has noted that its Access Analyzer and Config services would have detected the misconfiguration, but the contractor had not enabled these monitoring tools."
  },
  {
    id: 14, title: "New Android Malware Steals Banking Credentials via Accessibility Services", source: "The Hacker News", date: "Mar 21, 2026", category: "Malware", severity: "High", readTime: "5 min",
    summary: "A new Android banking trojan called 'Chameleon 2.0' can bypass biometric authentication and overlay fake login screens on 147 banking apps across 23 countries.",
    fullContent: "ThreatFabric researchers have identified a sophisticated new Android banking trojan dubbed 'Chameleon 2.0' being distributed through fake Chrome browser updates and malicious apps on third-party app stores. The malware targets 147 banking applications across 23 countries.\n\nChameleon 2.0 abuses Android's Accessibility Services to perform overlay attacks, displaying convincing fake login screens on top of legitimate banking apps. Its most notable capability is the ability to bypass biometric authentication by forcing a fallback to PIN entry, which it then captures via keylogging. The malware also intercepts SMS-based one-time passwords and can approve push notifications for two-factor authentication.\n\nGoogle has confirmed that no apps distributing the malware were found on the Play Store, and Play Protect detects known variants. Users are advised to only install apps from the official Play Store, be cautious of any app requesting Accessibility Service permissions, and ensure Play Protect is enabled. Banking app developers are being urged to implement runtime application self-protection (RASP) to detect overlay attacks."
  },
  {
    id: 15, title: "Signal Protocol Vulnerability Allows Message Metadata Leakage", source: "Wired", date: "Mar 21, 2026", category: "Privacy", severity: "Medium", readTime: "5 min",
    summary: "Researchers discover a side-channel vulnerability in the Signal protocol implementation that could allow a network-level adversary to determine who is communicating with whom, despite end-to-end encryption.",
    fullContent: "Cryptographers at the University of Waterloo have published a paper detailing a side-channel vulnerability in the Signal protocol's sealed sender implementation. While the vulnerability does not compromise message content (which remains protected by end-to-end encryption), it allows a sophisticated network-level adversary to correlate senders and recipients with high accuracy.\n\nThe attack exploits timing patterns in the sealed sender delivery mechanism. By observing network traffic metadata — packet sizes, timing intervals, and connection patterns — a state-level adversary monitoring network infrastructure could determine communication pairs with approximately 82% accuracy under laboratory conditions.\n\nSignal has acknowledged the research and is working on mitigations, including adding random delays and padding to the sealed sender mechanism. The Signal Foundation emphasized that exploiting this vulnerability requires sustained access to network infrastructure at the ISP or state level, making it relevant primarily for high-risk users such as journalists, activists, and dissidents. A protocol update is expected within 4-6 weeks."
  },
  {
    id: 16, title: "Major ISP Confirms BGP Hijacking Incident Redirected Traffic Through China", source: "Ars Technica", date: "Mar 20, 2026", category: "Nation State", severity: "High", readTime: "6 min",
    summary: "Lumen Technologies confirmed that a BGP hijacking incident redirected internet traffic for major US websites through Chinese telecom infrastructure for approximately 6 hours.",
    fullContent: "Lumen Technologies (formerly CenturyLink) has confirmed a significant BGP hijacking incident in which routes for several major US websites and cloud services were redirected through China Telecom's network for approximately 6 hours on March 19.\n\nBGP (Border Gateway Protocol) is the routing protocol that determines how internet traffic flows between networks. By announcing false routes, an attacker can redirect traffic through their infrastructure, potentially enabling surveillance or traffic manipulation. The hijacked routes affected traffic destined for several government websites, financial institutions, and major cloud providers.\n\nWhile the affected traffic was encrypted via TLS, security experts warn that a state-level adversary could potentially perform metadata analysis, attempt TLS downgrade attacks, or stockpile encrypted traffic for future decryption. NIST and CISA have renewed calls for accelerated adoption of RPKI (Resource Public Key Infrastructure) and BGPsec to prevent unauthorized route announcements. China Telecom has denied intentional involvement, attributing the incident to a configuration error."
  },
  {
    id: 17, title: "Hospitals Hit by Coordinated Ransomware Attack Across Three States", source: "Krebs on Security", date: "Mar 20, 2026", category: "Ransomware", severity: "Critical", readTime: "6 min",
    summary: "A coordinated ransomware attack has disrupted operations at 14 hospitals across Texas, Oklahoma, and Arkansas, forcing emergency room diversions and cancellation of elective surgeries.",
    fullContent: "Fourteen hospitals operated by MidSouth Health Network have been hit by a coordinated ransomware attack, forcing the health system to activate emergency protocols and divert ambulances to alternative facilities. The attack, attributed to the BlackSuit ransomware gang, has encrypted critical systems including electronic health records, lab systems, and pharmacy management platforms.\n\nEmergency departments at affected hospitals are operating on paper-based systems, and all elective surgeries have been cancelled indefinitely. Critical care patients are being stabilized and transferred to unaffected facilities. The attack represents one of the largest coordinated assaults on healthcare infrastructure in US history.\n\nThe FBI and CISA have deployed incident response teams. BlackSuit has demanded $30 million in cryptocurrency, threatening to release patient data if the ransom is not paid within 10 days. MidSouth's CEO stated the organization will not pay the ransom and is working to restore systems from backups. The HHS has issued a sector-wide alert urging all healthcare organizations to review their security posture and ensure offline backups are current."
  },
  {
    id: 18, title: "Researchers Demonstrate Practical Attack on Post-Quantum Cryptography Candidate", source: "SecurityWeek", date: "Mar 19, 2026", category: "Vulnerability", severity: "Medium", readTime: "5 min",
    summary: "A team at KU Leuven has demonstrated a practical side-channel attack against CRYSTALS-Kyber, one of NIST's selected post-quantum cryptography standards, raising concerns about real-world implementations.",
    fullContent: "Researchers at KU Leuven have published a paper demonstrating a practical electromagnetic side-channel attack against hardware implementations of CRYSTALS-Kyber, one of the algorithms selected by NIST for post-quantum cryptographic standardization.\n\nThe attack recovers the full secret key by analyzing electromagnetic emissions from a target device during approximately 10,000 decapsulation operations. While this requires physical proximity to the target device, the researchers note that the attack succeeds against multiple commercially available hardware security modules (HSMs) and secure enclaves.\n\nThe researchers emphasize that this is an implementation vulnerability rather than a flaw in the mathematical foundation of Kyber itself. Proper countermeasures including masking, shuffling, and constant-time implementations can mitigate the attack. NIST has stated that the finding does not affect Kyber's standardization status but underscores the importance of careful implementation. Hardware vendors are being notified and are expected to release firmware updates incorporating additional side-channel protections."
  },
  {
    id: 19, title: "TikTok Zero-Day Allowed Silent Account Takeover via DM", source: "BleepingComputer", date: "Mar 19, 2026", category: "Zero Day", severity: "High", readTime: "4 min",
    summary: "A zero-click vulnerability in TikTok's direct messaging feature allowed attackers to hijack any account by simply sending a specially crafted message. The flaw was exploited against high-profile accounts.",
    fullContent: "A critical zero-click vulnerability in TikTok's direct messaging system allowed attackers to take full control of any account without any user interaction. The flaw, discovered after several celebrity and politician accounts were compromised, was caused by a deserialization vulnerability in TikTok's message processing engine.\n\nSending a specially crafted message to a target was sufficient to execute arbitrary code within the TikTok app context, enabling the attacker to access the victim's account token, post content, read private messages, and access linked personal information. The vulnerability affected both iOS and Android versions of the app.\n\nTikTok patched the vulnerability within 48 hours of receiving the report from Project Zero researchers and confirmed that approximately 200 high-profile accounts were targeted before the fix was deployed. The company has implemented additional server-side validation and sandboxing for message processing. Users do not need to take any action as the fix was applied server-side."
  },
  {
    id: 20, title: "New Phishing Kit Uses Real-Time Man-in-the-Middle to Defeat MFA", source: "Threatpost", date: "Mar 18, 2026", category: "Phishing", severity: "High", readTime: "5 min",
    summary: "A phishing-as-a-service platform called 'EvilProxy 2.0' can bypass all forms of MFA in real-time, including hardware security keys, by acting as a transparent reverse proxy between victims and legitimate sites.",
    fullContent: "A new phishing-as-a-service (PhaaS) platform dubbed 'EvilProxy 2.0' has been identified by Proofpoint researchers, offering unprecedented capabilities for bypassing multi-factor authentication. The platform is available on underground forums for $2,000 per month and includes support for targeting over 300 popular services.\n\nUnlike traditional phishing kits that present static login pages, EvilProxy 2.0 operates as a real-time reverse proxy, sitting transparently between the victim and the legitimate website. When a victim enters their credentials and completes MFA — including FIDO2 hardware key challenges — the platform captures the authenticated session token, granting the attacker full account access.\n\nThe only reliable defense against this type of attack is client-side verification of the website's origin, which FIDO2 passkeys implement through origin binding. Organizations are urged to accelerate adoption of passkeys and implement additional controls such as device trust policies, impossible travel detection, and session anomaly monitoring. Proofpoint has released indicators of compromise for known EvilProxy 2.0 infrastructure."
  },
  {
    id: 21, title: "Open Source Intelligence Tools Used to Track Military Movements in Real-Time", source: "Wired", date: "Mar 18, 2026", category: "Privacy", severity: "Medium", readTime: "6 min",
    summary: "Investigators demonstrate how commercially available OSINT tools and mobile advertising data can track military personnel movements with alarming precision, raising national security concerns.",
    fullContent: "An investigation by a coalition of journalists and security researchers has demonstrated that commercially available location data from mobile advertising networks can be used to track the movements of military and intelligence personnel with startling accuracy.\n\nUsing data purchased from a commercial data broker for under $10,000, the researchers were able to identify devices belonging to personnel at NSA, CIA, and Pentagon facilities by analyzing movement patterns between known government installations and residential areas. They tracked individual devices to homes, hotels, and even sensitive meeting locations.\n\nThe investigation has prompted bipartisan calls for legislation restricting the sale of location data near sensitive government facilities. The DoD has issued updated guidance prohibiting personal mobile devices in certain areas and recommending military personnel disable advertising identifiers and location services. Privacy advocates argue the findings demonstrate the broader surveillance implications of the unregulated data broker industry for all citizens, not just government employees."
  },
  {
    id: 22, title: "Kubernetes Clusters Worldwide Hit by Cryptojacking Campaign", source: "The Hacker News", date: "Mar 17, 2026", category: "Cloud Security", severity: "Medium", readTime: "4 min",
    summary: "A widespread cryptojacking campaign has compromised over 5,000 Kubernetes clusters by exploiting misconfigured RBAC settings and exposed API servers to deploy Monero mining containers.",
    fullContent: "Aqua Security's threat research team has uncovered a massive cryptojacking campaign targeting misconfigured Kubernetes clusters worldwide. The campaign, active since early February, has compromised an estimated 5,000+ clusters across cloud providers including AWS, Azure, and GCP.\n\nThe attackers scan for Kubernetes API servers exposed to the internet with anonymous authentication enabled or weak RBAC configurations. Once access is obtained, they deploy privileged containers running optimized Monero cryptocurrency miners, configured to use no more than 80% of available CPU resources to avoid triggering performance alerts.\n\nThe estimated total computing resources hijacked generate approximately $1.2 million in cryptocurrency per month. Organizations should audit their Kubernetes configurations using tools like kube-bench, ensure API servers are not publicly accessible, implement network policies, enable audit logging, and use admission controllers to prevent privileged container deployment. Aqua has released YARA rules and IoCs for detecting the mining containers."
  }
];

const threatAlerts = [
  "CVE-2026-1847: Critical Linux kernel zero-day under active exploitation -- Patch immediately",
  "ALERT: LockBit 4.0 ransomware bypassing major EDR solutions -- Update detection signatures",
  "WARNING: Mass exploitation of SecureTransfer Pro (CVE-2026-0912) by Cl0p ransomware gang",
  "ADVISORY: AI deepfake phishing targeting Fortune 500 executives -- $47M in losses reported",
  "CRITICAL: 340M healthcare records exposed in MedVault breach -- Check if affected",
  "ALERT: NPM supply chain attack on event-stream-utils -- Audit your dependencies",
  "WARNING: Sandworm targeting NATO power grids with new ICS malware framework",
  "ADVISORY: EvilProxy 2.0 PhaaS defeats all MFA types including FIDO2 hardware keys",
  "CRITICAL: 14 hospitals disrupted by coordinated BlackSuit ransomware attack",
  "ALERT: Chrome zero-day CVE-2026-2103 exploited in the wild -- Update immediately"
];

const trendingTopics = [
  { label: "Ransomware", count: 487 }, { label: "Zero Day", count: 312 }, { label: "AI Security", count: 298 },
  { label: "Data Breach", count: 276 }, { label: "Supply Chain", count: 234 }, { label: "Phishing", count: 221 },
  { label: "Cloud Security", count: 198 }, { label: "Nation State", count: 187 }, { label: "Malware", count: 176 },
  { label: "Privacy", count: 165 }, { label: "Vulnerability", count: 154 }, { label: "IoT Security", count: 132 },
  { label: "Deepfake", count: 121 }, { label: "CISA", count: 109 }, { label: "Cryptojacking", count: 98 },
  { label: "Kubernetes", count: 87 }, { label: "EDR Bypass", count: 76 }, { label: "BGP Hijack", count: 65 }
];

const allCategories = ["All", "Ransomware", "Data Breach", "Vulnerability", "Malware", "Privacy", "AI Security", "Nation State", "Zero Day", "Supply Chain", "Phishing", "Cloud Security", "Regulation"];

const CyberNews = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredTopic, setHoveredTopic] = useState(null);
  const [tickerOffset, setTickerOffset] = useState(0);
  const tickerRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => setTickerOffset((p) => p - 1), 30);
    return () => clearInterval(interval);
  }, []);

  const filteredArticles = newsArticles.filter((a) => {
    const matchesCat = activeCategory === "All" || a.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || a.source.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const breakingArticle = filteredArticles.find((a) => a.breaking) || filteredArticles[0];
  const regularArticles = filteredArticles.filter((a) => a !== breakingArticle);

  const toggleExpand = (id) => setExpandedArticle(expandedArticle === id ? null : id);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (newsletterEmail.includes("@")) { setNewsletterSubmitted(true); setNewsletterEmail(""); }
  };

  const tickerText = threatAlerts.join("     \u2022     ");
  const tickerWidth = tickerText.length * 8;

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO title="Cyber News - VRIKAAN" description="Real-time cybersecurity news, threat alerts, and breaking security intelligence." />
      <Navbar />

      {/* Threat Ticker */}
      <div style={{ background: "linear-gradient(90deg, rgba(239,68,68,0.15) 0%, rgba(99,102,241,0.10) 50%, rgba(239,68,68,0.15) 100%)", borderBottom: `1px solid ${T.border}`, overflow: "hidden", whiteSpace: "nowrap", padding: "10px 0", marginTop: 80 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 16 }}>
          <span style={{ background: T.red, color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 11, padding: "3px 10px", borderRadius: 4, letterSpacing: 1, flexShrink: 0, animation: "pulse 2s infinite" }}>LIVE THREATS</span>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <div ref={tickerRef} style={{ display: "inline-block", whiteSpace: "nowrap", transform: `translateX(${tickerOffset % (tickerWidth + 600)}px)`, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: T.red, letterSpacing: 0.3 }}>
              {tickerText}{"     \u2022     "}{tickerText}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Page Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, color: T.white, margin: 0, lineHeight: 1.1 }}>
            Cyber <span style={{ color: T.accent }}>News</span> Feed
          </h1>
          <p style={{ color: T.muted, fontSize: 16, marginTop: 12, maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}>
            Real-time cybersecurity intelligence. Stay ahead of threats with curated news from trusted sources.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ maxWidth: 600, margin: "0 auto 32px", position: "relative" }}>
          <svg style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={T.muted} strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            type="text" placeholder="Search news articles, sources, topics..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", padding: "14px 16px 14px 44px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, color: T.white, fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif", outline: "none", transition: "border-color 0.2s" }}
            onFocus={(e) => (e.target.style.borderColor = T.accent)} onBlur={(e) => (e.target.style.borderColor = T.border)}
          />
        </div>

        {/* Category Filter Tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 40 }}>
          {allCategories.map((cat) => {
            const isActive = activeCategory === cat;
            const isHovered = hoveredCategory === cat;
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)} onMouseEnter={() => setHoveredCategory(cat)} onMouseLeave={() => setHoveredCategory(null)}
                style={{ padding: "8px 18px", borderRadius: 20, border: isActive ? "none" : `1px solid ${T.border}`, background: isActive ? T.accent : isHovered ? "rgba(99,102,241,0.1)" : "transparent", color: isActive ? "#fff" : isHovered ? T.accent : T.muted, fontSize: 13, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", cursor: "pointer", transition: "all 0.2s", letterSpacing: 0.3 }}>
                {cat}
                {cat !== "All" && <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>({newsArticles.filter((a) => a.category === cat).length})</span>}
              </button>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 32, alignItems: "start" }}>
          {/* Main Content */}
          <div>
            {/* Breaking News / Featured */}
            {breakingArticle && (
              <div
                onClick={() => toggleExpand(breakingArticle.id)}
                onMouseEnter={() => setHoveredCard("breaking")} onMouseLeave={() => setHoveredCard(null)}
                style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(17,24,39,0.8) 40%, rgba(99,102,241,0.06) 100%)", border: `1px solid ${hoveredCard === "breaking" ? "rgba(239,68,68,0.3)" : T.border}`, borderRadius: 16, padding: 28, marginBottom: 32, cursor: "pointer", transition: "all 0.3s", transform: hoveredCard === "breaking" ? "translateY(-2px)" : "none", boxShadow: hoveredCard === "breaking" ? "0 8px 32px rgba(239,68,68,0.1)" : "none" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{ background: T.red, color: "#fff", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 11, padding: "4px 12px", borderRadius: 4, letterSpacing: 1, animation: "pulse 2s infinite" }}>BREAKING</span>
                  <span style={{ background: severityBg[breakingArticle.severity], color: severityColors[breakingArticle.severity], fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 4 }}>{breakingArticle.severity.toUpperCase()}</span>
                  <span style={{ color: T.muted, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>{breakingArticle.date}</span>
                </div>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: T.white, margin: "0 0 12px", lineHeight: 1.3 }}>{breakingArticle.title}</h2>
                <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.6, margin: "0 0 16px" }}>{breakingArticle.summary}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <span style={{ color: categoryColors[breakingArticle.category] || T.accent, fontSize: 12, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", background: `${categoryColors[breakingArticle.category] || T.accent}15`, padding: "4px 10px", borderRadius: 6 }}>{breakingArticle.category}</span>
                  <span style={{ color: T.muted, fontSize: 12 }}>Source: <span style={{ color: T.cyan }}>{breakingArticle.source}</span></span>
                  <span style={{ color: T.muted, fontSize: 12 }}>{breakingArticle.readTime} read</span>
                  <span style={{ color: T.accent, fontSize: 12, fontWeight: 600, marginLeft: "auto" }}>{expandedArticle === breakingArticle.id ? "Click to collapse" : "Click to read more"} &rarr;</span>
                </div>
                {expandedArticle === breakingArticle.id && (
                  <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${T.border}` }}>
                    {breakingArticle.fullContent.split("\n\n").map((p, i) => (
                      <p key={i} style={{ color: "rgba(241,245,249,0.85)", fontSize: 14, lineHeight: 1.8, margin: "0 0 16px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{p}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Article Cards */}
            {regularArticles.map((article) => {
              const isExpanded = expandedArticle === article.id;
              const isHovered = hoveredCard === article.id;
              return (
                <div key={article.id} onClick={() => toggleExpand(article.id)} onMouseEnter={() => setHoveredCard(article.id)} onMouseLeave={() => setHoveredCard(null)}
                  style={{ background: T.card, border: `1px solid ${isHovered ? "rgba(99,102,241,0.2)" : T.border}`, borderRadius: 14, padding: 24, marginBottom: 16, cursor: "pointer", transition: "all 0.3s", transform: isHovered ? "translateY(-1px)" : "none", boxShadow: isHovered ? "0 4px 24px rgba(99,102,241,0.06)" : "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                    <span style={{ background: severityBg[article.severity], color: severityColors[article.severity], fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4, letterSpacing: 0.5 }}>{article.severity.toUpperCase()}</span>
                    <span style={{ color: categoryColors[article.category] || T.accent, fontSize: 11, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", background: `${categoryColors[article.category] || T.accent}12`, padding: "3px 8px", borderRadius: 4 }}>{article.category}</span>
                    <span style={{ color: T.muted, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginLeft: "auto" }}>{article.date}</span>
                  </div>
                  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: T.white, margin: "0 0 10px", lineHeight: 1.3 }}>{article.title}</h3>
                  <p style={{ color: T.muted, fontSize: 13, lineHeight: 1.6, margin: "0 0 14px" }}>{article.summary}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <span style={{ color: T.cyan, fontSize: 11, fontWeight: 500 }}>{article.source}</span>
                    <span style={{ color: T.muted, fontSize: 11 }}>{article.readTime} read</span>
                    <span style={{ color: T.accent, fontSize: 11, fontWeight: 600, marginLeft: "auto", opacity: isHovered ? 1 : 0, transition: "opacity 0.2s" }}>{isExpanded ? "Collapse" : "Read more"} &rarr;</span>
                  </div>
                  {isExpanded && (
                    <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${T.border}` }}>
                      {article.fullContent.split("\n\n").map((p, i) => (
                        <p key={i} style={{ color: "rgba(241,245,249,0.85)", fontSize: 14, lineHeight: 1.8, margin: "0 0 14px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{p}</p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredArticles.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke={T.muted} strokeWidth="1.5" style={{ marginBottom: 16, opacity: 0.5 }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", color: T.white, fontSize: 20, margin: "0 0 8px" }}>No articles found</h3>
                <p style={{ color: T.muted, fontSize: 14 }}>Try adjusting your search or category filter.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ position: "sticky", top: 120 }}>
            {/* Trending Topics */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: T.white, margin: "0 0 18px", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={T.cyan} strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                Trending Topics
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {trendingTopics.map((topic) => {
                  const isHovered = hoveredTopic === topic.label;
                  const size = Math.max(11, Math.min(15, 10 + topic.count / 60));
                  return (
                    <button key={topic.label}
                      onClick={() => { setSearchQuery(topic.label); setActiveCategory("All"); }}
                      onMouseEnter={() => setHoveredTopic(topic.label)} onMouseLeave={() => setHoveredTopic(null)}
                      style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${isHovered ? "rgba(99,102,241,0.3)" : T.border}`, background: isHovered ? "rgba(99,102,241,0.1)" : "transparent", color: isHovered ? T.accent : T.muted, fontSize: size, fontWeight: 500, fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}
                    >
                      {topic.label} <span style={{ fontSize: 10, opacity: 0.6 }}>({topic.count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Threat Level Summary */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: T.white, margin: "0 0 18px", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={T.red} strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                Severity Breakdown
              </h3>
              {["Critical", "High", "Medium", "Low"].map((sev) => {
                const count = newsArticles.filter((a) => a.severity === sev).length;
                const pct = (count / newsArticles.length) * 100;
                return (
                  <div key={sev} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ color: severityColors[sev], fontSize: 12, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>{sev}</span>
                      <span style={{ color: T.muted, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>{count} articles</span>
                    </div>
                    <div style={{ height: 6, background: "rgba(148,163,184,0.08)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: severityColors[sev], borderRadius: 3, transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Top Sources */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: T.white, margin: "0 0 18px", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={T.accent} strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></svg>
                Top Sources
              </h3>
              {sources.slice(0, 6).map((src) => {
                const count = newsArticles.filter((a) => a.source === src).length;
                return (
                  <div key={src} onClick={() => { setSearchQuery(src); setActiveCategory("All"); }}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.border}`, cursor: "pointer" }}
                  >
                    <span style={{ color: T.white, fontSize: 13 }}>{src}</span>
                    <span style={{ color: T.cyan, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Newsletter Signup */}
            <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(17,24,39,0.8) 100%)", border: `1px solid rgba(99,102,241,0.15)`, borderRadius: 14, padding: 24 }}>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: T.white, margin: "0 0 8px" }}>
                Threat Intel Digest
              </h3>
              <p style={{ color: T.muted, fontSize: 13, lineHeight: 1.5, margin: "0 0 16px" }}>
                Get critical security alerts and weekly threat roundups delivered to your inbox.
              </p>
              {newsletterSubmitted ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "rgba(34,197,94,0.1)", borderRadius: 10, border: "1px solid rgba(34,197,94,0.2)" }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={T.green} strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  <span style={{ color: T.green, fontSize: 13, fontWeight: 600 }}>Subscribed successfully!</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletter} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    type="email" placeholder="your@email.com" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)}
                    style={{ padding: "10px 14px", background: "rgba(17,24,39,0.6)", border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", outline: "none" }}
                    onFocus={(e) => (e.target.style.borderColor = T.accent)} onBlur={(e) => (e.target.style.borderColor = T.border)}
                  />
                  <button type="submit" style={{ padding: "10px 0", background: T.accent, border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", cursor: "pointer", transition: "opacity 0.2s", letterSpacing: 0.5 }}
                    onMouseEnter={(e) => (e.target.style.opacity = "0.85")} onMouseLeave={(e) => (e.target.style.opacity = "1")}
                  >
                    Subscribe to Alerts
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 48, padding: "24px 0", borderTop: `1px solid ${T.border}` }}>
          {[
            { label: "Articles Today", value: "22", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2", color: T.accent },
            { label: "Critical Alerts", value: "6", icon: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z", color: T.red },
            { label: "Sources Monitored", value: "48", icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9", color: T.cyan },
            { label: "Threat Level", value: "HIGH", icon: "M13 10V3L4 14h7v7l9-11h-7z", color: T.orange }
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: "center", padding: "16px 12px" }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke={stat.color} strokeWidth="1.5" style={{ marginBottom: 8 }}><path d={stat.icon} /></svg>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ color: T.muted, fontSize: 12, marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns: \"1fr 320px\""] { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default CyberNews;
