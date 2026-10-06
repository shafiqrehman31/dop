export interface Lead {
  id: string;
  source: 'quiz' | 'calculator' | 'inquiry_form';
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  postcode: string;
  depositAmount: number;
  tenancyDurationMonths?: number;
  renewalsCount: number;
  propertyLocation: 'england_wales' | 'scotland' | 'northern_ireland';
  paidWithinSixYears: boolean;
  protectedWithin30Days: 'yes' | 'no' | 'dont_know' | 'late';
  receivedPrescribedInfo: 'yes' | 'no' | 'dont_know';
  hasTenancyAgreement: 'yes' | 'no' | 'retrieving';
  tenancyStatus: 'current_tenant' | 'moved_out';
  estimatedCompensationMin: number;
  estimatedCompensationMax: number;
  status: 'new' | 'contacted' | 'in_review' | 'qualified' | 'closed';
  notes?: string;
  pipedriveSynced: boolean;
  pipedriveDealId?: string;
  ipAddress?: string;
  message?: string;
}

export interface CmsContent {
  siteName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  officeAddress: string;
  heroBadge: string;
  heroHeadline: string;
  heroSubtitle: string;
  ctaText: string;
  logoUrl?: string;
  faviconUrl?: string;
  stats: {
    claimsRecovered: string;
    successRate: string;
    averagePayout: string;
    clientRating: string;
  };
  services: Array<{
    id: string;
    title: string;
    tagline: string;
    description: string;
    statKicker: string;
  }>;
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
  legalDisclaimer: string;
}

export const DEFAULT_CMS: CmsContent = {
  siteName: 'Deposit Hero',
  tagline: 'UK Tenancy Deposit Claim Specialists',
  contactEmail: 'claims@mydeposithero.co.uk',
  contactPhone: '0800 048 5321',
  officeAddress: '124 City Road, London, EC1V 2NX, United Kingdom',
  heroBadge: 'Regulated Tenancy Deposit Recovery Specialists',
  heroHeadline: 'Claim up to 3x your tenancy deposit compensation.',
  heroSubtitle: 'Under the UK Housing Act 2004, if your landlord failed to protect your deposit in an approved scheme within 30 days or provide prescribed information, you could be legally owed £1,000s in compensation. 100% No Win No Fee.',
  ctaText: 'Check Eligibility in 60s',
  logoUrl: '',
  faviconUrl: '',
  stats: {
    claimsRecovered: '£4.2M+',
    successRate: '98.4%',
    averagePayout: '£2,850',
    clientRating: '4.9 / 5.0',
  },
  services: [
    {
      id: 'srv-1',
      title: 'Unprotected Deposit Claims',
      tagline: 'Housing Act 2004 Section 213 Enforcement',
      description: 'If your landlord or letting agent kept your deposit in their private bank account without registering it in DPS, TDS, or MyDeposits, they are strictly liable for 1x to 3x the deposit amount in compensation.',
      statKicker: 'Statutory Penalty 1x - 3x Deposit Value',
    },
    {
      id: 'srv-2',
      title: 'Late Deposit Protection Claims',
      tagline: '30-Day Strict Legal Window',
      description: 'Even if your landlord eventually protected your deposit, doing so after the statutory 30-day deadline remains an irrevocable legal breach. You remain fully eligible for compensation.',
      statKicker: 'Late Compliance Does Not Cancel The Breach',
    },
    {
      id: 'srv-3',
      title: 'Prescribed Information Failures',
      tagline: 'Statutory Notice & Certificate Omission',
      description: 'Landlords are legally required to provide official scheme information, contact details, dispute procedures, and deposit certificate within 30 days. Failure triggers the exact same 1x-3x penalty.',
      statKicker: 'Strict Technical Liability for Landlords',
    },
    {
      id: 'srv-4',
      title: 'Tenancy Renewal Multipliers',
      tagline: 'Superstrike vs Rodrigues Precedent',
      description: 'If your tenancy was renewed or became a periodic tenancy, each term counts as a separate deposit transaction under UK case law, potentially doubling or tripling your total compensation award.',
      statKicker: 'Separate Penalties Per Renewal Term',
    },
  ],
  faqs: [
    {
      id: 'faq-1',
      question: 'Can my landlord evict me if I make a deposit compensation claim?',
      answer: 'No. Retaliatory eviction is unlawful. If your deposit was not protected or protected late, your landlord cannot serve a valid Section 21 eviction notice until the deposit has been returned to you in full. Furthermore, most claims are settled once you have moved out, with a 6-year limitation period from tenancy commencement.',
    },
    {
      id: 'faq-2',
      question: 'How much compensation could I receive?',
      answer: 'Under Section 214 of the Housing Act 2004, the court must order the landlord to pay a statutory penalty of between 1 and 3 times the amount of the deposit for each breach, in addition to ordering the return of your original deposit.',
    },
    {
      id: 'faq-3',
      question: 'What does "No Win, No Fee" mean for my tenancy claim?',
      answer: 'It means there are no upfront costs, no hidden retainers, and zero financial risk to you. If your claim is unsuccessful, you pay nothing. Our solicitors only deduct an agreed success fee from the compensation awarded if and when we win your case.',
    },
    {
      id: 'faq-4',
      question: 'What if I do not have a copy of my tenancy agreement or proof of payment?',
      answer: 'Do not worry. Our legal team can perform formal searches across all three government-approved deposit schemes (DPS, TDS, MyDeposits) and request tenancy records directly from the letting agent on your behalf.',
    },
    {
      id: 'faq-5',
      question: 'How long do I have to submit a claim?',
      answer: 'Under the Limitation Act 1980, you have up to 6 years from the date your deposit should have been protected (30 days after you paid it) to bring a claim, even if you moved out years ago.',
    },
  ],
  legalDisclaimer: 'Deposit Hero is a dedicated legal intake portal working alongside SRA-regulated solicitors in England and Wales. Regulated services are governed by the Solicitors Regulation Authority. 100% No Win No Fee agreements are subject to solicitor assessment.',
};

export interface PipedriveConfig {
  encryptedToken?: string;
  tokenMasked: string;
  iv?: string;
  tag?: string;
  companyDomain: string;
  stageId: string;
  pipelineId: string;
  autoSync: boolean;
  lastTestedAt?: string;
  lastTestStatus?: 'success' | 'failed' | 'idle';
  lastTestMessage?: string;
}

export interface AnalyticsData {
  totalVisitors: number;
  quizStarts: number;
  quizCompletions: number;
  inquirySubmissions: number;
  qualifiedLeadsCount: number;
  totalClaimPipelineValue: number;
  conversionRate: number;
  dailyTrends: Array<{
    date: string;
    visitors: number;
    leads: number;
    pipelineValue: number;
  }>;
  breachTypes: {
    unprotected: number;
    lateProtected: number;
    noPrescribedInfo: number;
    multipleRenewals: number;
  };
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  mfaEnabled: boolean;
  mfaSecret?: string;
  backupCodes: string[];
}

export interface AuthSession {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    mfaEnabled: boolean;
  };
  expiresAt: string;
}
