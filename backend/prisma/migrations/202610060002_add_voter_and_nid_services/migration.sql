INSERT INTO "OfficialService" (
  "id", "slug", "nameNp", "nameEn", "categoryNp", "categoryEn",
  "descriptionNp", "descriptionEn", "officialWebsiteUrl", "officialApplicationUrl",
  "officialSourceUrl", "sourceName", "sourceDocumentName", "verificationStatus",
  "verifiedAt", "keywordsJson", "displayOrder", "isPublished", "createdAt", "updatedAt"
) VALUES
(
  'official-voter-registration', 'voter-registration-and-id', 'मतदाता नामावली दर्ता तथा परिचयपत्र', 'Voter Registration and Voter ID', 'निर्वाचन सेवा', 'Election services',
  'निर्वाचन आयोगका अनुसार नेपाली नागरिकले १६ वर्ष पुगेपछि मतदाता नामावलीमा नाम दर्ता गर्न सक्छन्; मतदान गर्न १८ वर्ष पुगेको हुनुपर्छ। आयोगले मतदाता परिचयपत्र मतदाता नामावलीका आधारमा उत्पादन र वितरण गर्छ। हालको दर्ता समय र स्थानीय प्रक्रिया निर्वाचन आयोगसँग पुष्टि गर्नुहोस्।',
  'The Election Commission says Nepali citizens may register on the voter roll from age 16; eligibility to vote begins at 18. Voter identity cards are produced and distributed based on the voter roll. Confirm current registration availability and local arrangements with the Election Commission.',
  'https://election.gov.np/en/page/register-to-vote', 'https://applyvr.election.gov.np/',
  'https://election.gov.np/en/page/register-to-vote', 'Election Commission Nepal', 'Register to Vote; online pre-registration portal', 'VERIFIED',
  '2026-10-06 00:00:00', '["voter", "voting card", "voter id", "voter identity card", "voter registration", "मतदाता", "मतदाता परिचयपत्र", "मतदाता नामावली"]', 30, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'official-national-id-enrollment', 'national-id-enrollment', 'राष्ट्रिय परिचयपत्र दर्ता तथा बनाउने सेवा', 'National ID Enrollment', 'राष्ट्रिय परिचयपत्र सेवा', 'National Identity services',
  'राष्ट्रिय परिचयपत्र तथा पञ्जीकरण विभागको अनलाइन पूर्व-दर्ता प्रणालीबाट विवरण भरी जैविक विवरण सङ्कलनका लागि समय लिन सकिन्छ। आवेदन योग्यता, आवश्यक कागजात, स्थानीय दर्ता केन्द्र र उपलब्ध समय विभागको आधिकारिक पोर्टलबाट पुष्टि गर्नुहोस्।',
  'The Department of National ID and Civil Registration provides an online pre-enrollment system for entering demographic details and booking an appointment for biometric capture. Confirm eligibility, required documents, local enrollment locations, and available appointments on the Department’s official portal.',
  'https://citizenportal.donidcr.gov.np/en', 'https://enrollment.donidcr.gov.np/PreEnrollment/',
  'https://donidcr.gov.np/', 'Department of National ID and Civil Registration, Government of Nepal', 'National ID pre-enrollment system and citizen portal', 'NEEDS_REVIEW',
  NULL, '["nid", "national id", "national identity card", "national id card", "national identity number", "nin", "राष्ट्रिय परिचयपत्र", "राष्ट्रिय परिचयपत्र नम्बर"]', 40, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);
