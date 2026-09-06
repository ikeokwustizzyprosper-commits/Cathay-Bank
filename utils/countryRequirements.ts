export interface CountryConfig {
    name: string;
    code: string;
    flag: string;
    dialCode: string;
    addressLabels: {
        street: string;
        apartment: string;
        city: string;
        state: string;
        statePlaceholder: string;
        postalCode: string;
        postalCodePlaceholder: string;
    };
    idTypes: Array<{ label: string; value: string }>;
    taxId: {
        typeLabel: string;
        types: string[];
        inputLabel: string;
        placeholder: string;
        complianceNotice: string;
    };
}

export const COUNTRY_REQUIREMENTS: Record<string, CountryConfig> = {
    'United States': {
        name: 'United States',
        code: 'US',
        flag: '🇺🇸',
        dialCode: '+1',
        addressLabels: {
            street: 'Residential Street Address *',
            apartment: 'Apartment / Suite',
            city: 'City *',
            state: 'State *',
            statePlaceholder: 'e.g. CA or California',
            postalCode: 'ZIP Code *',
            postalCodePlaceholder: 'e.g. 94111'
        },
        idTypes: [
            { label: "State Driver's License", value: "State Driver's License" },
            { label: "US Passport", value: "US Passport" },
            { label: "State Photo ID Card", value: "State Photo ID Card" },
            { label: "Permanent Resident Card (Green Card)", value: "Permanent Resident Card" },
            { label: "Military ID Card", value: "Military ID Card" }
        ],
        taxId: {
            typeLabel: 'Tax ID Classification *',
            types: [
                'Social Security Number (SSN)',
                'Individual Taxpayer Identification Number (ITIN)'
            ],
            inputLabel: 'SSN or ITIN Number *',
            placeholder: 'e.g. 9-digit Tax ID (XXX-XX-XXXX)',
            complianceNotice: 'In accordance with the USA PATRIOT Act and FinCEN Customer Due Diligence rules, all federally insured depository accounts require verification of US Tax Identification.'
        }
    },
    'United Kingdom': {
        name: 'United Kingdom',
        code: 'GB',
        flag: '🇬🇧',
        dialCode: '+44',
        addressLabels: {
            street: 'Street Address *',
            apartment: 'Flat / Unit / Building',
            city: 'Town / City *',
            state: 'County / Region *',
            statePlaceholder: 'e.g. Greater London',
            postalCode: 'UK Postcode *',
            postalCodePlaceholder: 'e.g. SW1A 1AA'
        },
        idTypes: [
            { label: 'UK Passport', value: 'UK Passport' },
            { label: 'UK Driving Licence', value: 'UK Driving Licence' },
            { label: 'Biometric Residence Permit (BRP)', value: 'Biometric Residence Permit' },
            { label: 'National Identity Card', value: 'National Identity Card' }
        ],
        taxId: {
            typeLabel: 'UK Tax Identifier *',
            types: [
                'National Insurance Number (NINO)',
                'Unique Taxpayer Reference (UTR)'
            ],
            inputLabel: 'National Insurance or UTR Number *',
            placeholder: 'e.g. QQ 12 34 56 A or 10-digit UTR',
            complianceNotice: 'Regulated under the UK Financial Conduct Authority (FCA) and HMRC statutory KYC & Anti-Money Laundering Regulations.'
        }
    },
    'Canada': {
        name: 'Canada',
        code: 'CA',
        flag: '🇨🇦',
        dialCode: '+1',
        addressLabels: {
            street: 'Civic Street Address *',
            apartment: 'Suite / Apt',
            city: 'City *',
            state: 'Province / Territory *',
            statePlaceholder: 'e.g. ON, BC, AB',
            postalCode: 'Postal Code *',
            postalCodePlaceholder: 'e.g. M5V 2T6'
        },
        idTypes: [
            { label: 'Canadian Passport', value: 'Canadian Passport' },
            { label: "Provincial Driver's Licence", value: "Provincial Driver's Licence" },
            { label: 'Provincial Photo Card', value: 'Provincial Photo Card' },
            { label: 'Permanent Resident Card', value: 'Permanent Resident Card' }
        ],
        taxId: {
            typeLabel: 'Canadian Tax ID *',
            types: [
                'Social Insurance Number (SIN)',
                'Business Tax Number (CRA BN)'
            ],
            inputLabel: 'Social Insurance Number (SIN) *',
            placeholder: 'e.g. 9-digit SIN (123-456-789)',
            complianceNotice: 'Under FINTRAC (Proceeds of Crime and Terrorist Financing Act) and CRA reporting standards, SIN verification is mandatory.'
        }
    },
    'Australia': {
        name: 'Australia',
        code: 'AU',
        flag: '🇦🇺',
        dialCode: '+61',
        addressLabels: {
            street: 'Street Address *',
            apartment: 'Unit / Level',
            city: 'Suburb / City *',
            state: 'State / Territory *',
            statePlaceholder: 'e.g. NSW, VIC, QLD',
            postalCode: 'Postcode *',
            postalCodePlaceholder: 'e.g. 2000'
        },
        idTypes: [
            { label: 'Australian Passport', value: 'Australian Passport' },
            { label: "Australian Driver Licence", value: "Australian Driver Licence" },
            { label: 'Medicare Card', value: 'Medicare Card' },
            { label: 'Proof of Age Card', value: 'Proof of Age Card' }
        ],
        taxId: {
            typeLabel: 'Tax File Number (TFN) *',
            types: [
                'Tax File Number (TFN)',
                'Australian Business Number (ABN)',
                'TFN Exemption Quoted'
            ],
            inputLabel: 'Tax File Number (TFN) *',
            placeholder: 'e.g. 8 or 9-digit TFN',
            complianceNotice: 'Compliant with AUSTRAC (Anti-Money Laundering and Counter-Terrorism Financing) and ATO compliance frameworks.'
        }
    },
    'Singapore': {
        name: 'Singapore',
        code: 'SG',
        flag: '🇸🇬',
        dialCode: '+65',
        addressLabels: {
            street: 'Street Name & Block *',
            apartment: 'Unit Number (#XX-XX)',
            city: 'District / Town *',
            state: 'Area / Region',
            statePlaceholder: 'e.g. Central Region',
            postalCode: '6-Digit Postal Code *',
            postalCodePlaceholder: 'e.g. 049318'
        },
        idTypes: [
            { label: 'Singapore NRIC (Pink/Blue)', value: 'Singapore NRIC' },
            { label: 'Singapore Passport', value: 'Singapore Passport' },
            { label: 'Employment Pass / FIN Card', value: 'Employment Pass / FIN' },
            { label: 'Work Permit / S-Pass', value: 'Work Permit' }
        ],
        taxId: {
            typeLabel: 'Tax Identification Number *',
            types: [
                'Singapore NRIC / FIN',
                'IRAS Tax Reference Number'
            ],
            inputLabel: 'NRIC / FIN Tax ID *',
            placeholder: 'e.g. S1234567A',
            complianceNotice: 'Compliant with Monetary Authority of Singapore (MAS) Notice 626 for Prevention of Money Laundering and Countering the Financing of Terrorism.'
        }
    },
    'Nigeria': {
        name: 'Nigeria',
        code: 'NG',
        flag: '🇳🇬',
        dialCode: '+234',
        addressLabels: {
            street: 'Street Address *',
            apartment: 'Flat / Suite / House No.',
            city: 'City / Town *',
            state: 'State *',
            statePlaceholder: 'e.g. Lagos, Abuja FCT, Rivers',
            postalCode: 'Postal / LGA Code *',
            postalCodePlaceholder: 'e.g. 100001'
        },
        idTypes: [
            { label: 'National Identity Card / NIN Slip', value: 'National Identity Card' },
            { label: 'Nigerian International Passport', value: 'Nigerian International Passport' },
            { label: "FRSC Driver's Licence", value: "FRSC Driver's Licence" },
            { label: "Permanent Voter's Card (PVC)", value: "Permanent Voter's Card" }
        ],
        taxId: {
            typeLabel: 'Banking Identity *',
            types: [
                'Bank Verification Number (BVN)',
                'National Identification Number (NIN)'
            ],
            inputLabel: 'BVN or NIN (11 digits) *',
            placeholder: 'e.g. 11-digit BVN (22234567890)',
            complianceNotice: 'In alignment with Central Bank of Nigeria (CBN) AML/CFT circulars and regulatory directives for biometric customer verification.'
        }
    },
    'European Union': {
        name: 'European Union',
        code: 'EU',
        flag: '🇪🇺',
        dialCode: '+49',
        addressLabels: {
            street: 'Street & House Number *',
            apartment: 'Appartement / Etage',
            city: 'City *',
            state: 'State / Province / Region *',
            statePlaceholder: 'e.g. Bavaria, Île-de-France, Madrid',
            postalCode: 'Postal Code *',
            postalCodePlaceholder: 'e.g. 10115'
        },
        idTypes: [
            { label: 'EU National Identity Card', value: 'EU National Identity Card' },
            { label: 'European Passport', value: 'European Passport' },
            { label: 'EU Residence Permit', value: 'EU Residence Permit' },
            { label: 'European Driver License', value: 'European Driver License' }
        ],
        taxId: {
            typeLabel: 'EU Tax Identification *',
            types: [
                'Tax Identification Number (TIN / Steuer-ID / NIF)',
                'National Personal ID / CPR'
            ],
            inputLabel: 'National Tax ID (TIN) *',
            placeholder: 'e.g. 11-digit TIN or national tax code',
            complianceNotice: 'Compliant with European Banking Authority (EBA) guidelines and the 6th EU Anti-Money Laundering Directive (6AMLD).'
        }
    },
    'Other International': {
        name: 'Other International',
        code: 'INT',
        flag: '🌐',
        dialCode: '+1',
        addressLabels: {
            street: 'Residential Street Address *',
            apartment: 'Apartment / Suite / Unit',
            city: 'City / Municipality *',
            state: 'Province / State / Region *',
            statePlaceholder: 'e.g. Region or Province',
            postalCode: 'Postal / ZIP Code *',
            postalCodePlaceholder: 'e.g. Postal Code'
        },
        idTypes: [
            { label: 'International Passport', value: 'International Passport' },
            { label: 'National Identity Card', value: 'National Identity Card' },
            { label: "Official Driver's License", value: "Official Driver's License" },
            { label: 'Government Photo Credential', value: 'Government Photo Credential' }
        ],
        taxId: {
            typeLabel: 'Tax Identification / National ID *',
            types: [
                'National Taxpayer Identification Number (TIN)',
                'National Citizen ID Number'
            ],
            inputLabel: 'Tax ID or National Identification Number *',
            placeholder: 'Enter national tax or personal ID',
            complianceNotice: 'Compliant with standard OECD Common Reporting Standard (CRS) and Foreign Account Tax Compliance Act (FATCA) customer identification rules.'
        }
    }
};

export interface CountryItem {
    name: string;
    code: string;
    flag: string;
    dialCode: string;
    isPopular?: boolean;
    region?: string;
}

export const ALL_COUNTRIES: CountryItem[] = [
    // Popular / Tier 1 Banking Hubs
    { name: 'United States', code: 'US', flag: '🇺🇸', dialCode: '+1', isPopular: true, region: 'Americas' },
    { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', dialCode: '+44', isPopular: true, region: 'Europe' },
    { name: 'Canada', code: 'CA', flag: '🇨🇦', dialCode: '+1', isPopular: true, region: 'Americas' },
    { name: 'Australia', code: 'AU', flag: '🇦🇺', dialCode: '+61', isPopular: true, region: 'Oceania' },
    { name: 'Singapore', code: 'SG', flag: '🇸🇬', dialCode: '+65', isPopular: true, region: 'Asia' },
    { name: 'Nigeria', code: 'NG', flag: '🇳🇬', dialCode: '+234', isPopular: true, region: 'Africa' },
    { name: 'European Union', code: 'EU', flag: '🇪🇺', dialCode: '+49', isPopular: true, region: 'Europe' },
    { name: 'Hong Kong', code: 'HK', flag: '🇭🇰', dialCode: '+852', isPopular: true, region: 'Asia' },
    { name: 'Taiwan', code: 'TW', flag: '🇹🇼', dialCode: '+886', isPopular: true, region: 'Asia' },
    { name: 'China', code: 'CN', flag: '🇨🇳', dialCode: '+86', isPopular: true, region: 'Asia' },
    { name: 'Japan', code: 'JP', flag: '🇯🇵', dialCode: '+81', isPopular: true, region: 'Asia' },
    { name: 'Germany', code: 'DE', flag: '🇩🇪', dialCode: '+49', isPopular: true, region: 'Europe' },
    { name: 'France', code: 'FR', flag: '🇫🇷', dialCode: '+33', isPopular: true, region: 'Europe' },

    // Additional Global Nations
    { name: 'Argentina', code: 'AR', flag: '🇦🇷', dialCode: '+54', region: 'Americas' },
    { name: 'Austria', code: 'AT', flag: '🇦🇹', dialCode: '+43', region: 'Europe' },
    { name: 'Bahamas', code: 'BS', flag: '🇧🇸', dialCode: '+1', region: 'Americas' },
    { name: 'Bahrain', code: 'BH', flag: '🇧🇭', dialCode: '+973', region: 'Middle East' },
    { name: 'Bangladesh', code: 'BD', flag: '🇧🇩', dialCode: '+880', region: 'Asia' },
    { name: 'Belgium', code: 'BE', flag: '🇧🇪', dialCode: '+32', region: 'Europe' },
    { name: 'Brazil', code: 'BR', flag: '🇧🇷', dialCode: '+55', region: 'Americas' },
    { name: 'Chile', code: 'CL', flag: '🇨🇱', dialCode: '+56', region: 'Americas' },
    { name: 'Colombia', code: 'CO', flag: '🇨🇴', dialCode: '+57', region: 'Americas' },
    { name: 'Costa Rica', code: 'CR', flag: '🇨🇷', dialCode: '+506', region: 'Americas' },
    { name: 'Croatia', code: 'HR', flag: '🇭🇷', dialCode: '+385', region: 'Europe' },
    { name: 'Cyprus', code: 'CY', flag: '🇨🇾', dialCode: '+357', region: 'Europe' },
    { name: 'Czech Republic', code: 'CZ', flag: '🇨🇿', dialCode: '+420', region: 'Europe' },
    { name: 'Denmark', code: 'DK', flag: '🇩🇰', dialCode: '+45', region: 'Europe' },
    { name: 'Dominican Republic', code: 'DO', flag: '🇩🇴', dialCode: '+1', region: 'Americas' },
    { name: 'Ecuador', code: 'EC', flag: '🇪🇨', dialCode: '+593', region: 'Americas' },
    { name: 'Egypt', code: 'EG', flag: '🇪🇬', dialCode: '+20', region: 'Africa' },
    { name: 'Finland', code: 'FI', flag: '🇫🇮', dialCode: '+358', region: 'Europe' },
    { name: 'Ghana', code: 'GH', flag: '🇬🇭', dialCode: '+233', region: 'Africa' },
    { name: 'Greece', code: 'GR', flag: '🇬🇷', dialCode: '+30', region: 'Europe' },
    { name: 'Hungary', code: 'HU', flag: '🇭🇺', dialCode: '+36', region: 'Europe' },
    { name: 'Iceland', code: 'IS', flag: '🇮🇸', dialCode: '+354', region: 'Europe' },
    { name: 'India', code: 'IN', flag: '🇮🇳', dialCode: '+91', region: 'Asia' },
    { name: 'Indonesia', code: 'ID', flag: '🇮🇩', dialCode: '+62', region: 'Asia' },
    { name: 'Ireland', code: 'IE', flag: '🇮🇪', dialCode: '+353', region: 'Europe' },
    { name: 'Israel', code: 'IL', flag: '🇮🇱', dialCode: '+972', region: 'Middle East' },
    { name: 'Italy', code: 'IT', flag: '🇮🇹', dialCode: '+39', region: 'Europe' },
    { name: 'Jamaica', code: 'JM', flag: '🇯🇲', dialCode: '+1', region: 'Americas' },
    { name: 'Jordan', code: 'JO', flag: '🇯🇴', dialCode: '+962', region: 'Middle East' },
    { name: 'Kenya', code: 'KE', flag: '🇰🇪', dialCode: '+254', region: 'Africa' },
    { name: 'Kuwait', code: 'KW', flag: '🇰🇼', dialCode: '+965', region: 'Middle East' },
    { name: 'Luxembourg', code: 'LU', flag: '🇱🇺', dialCode: '+352', region: 'Europe' },
    { name: 'Malaysia', code: 'MY', flag: '🇲🇾', dialCode: '+60', region: 'Asia' },
    { name: 'Malta', code: 'MT', flag: '🇲🇹', dialCode: '+356', region: 'Europe' },
    { name: 'Mexico', code: 'MX', flag: '🇲🇽', dialCode: '+52', region: 'Americas' },
    { name: 'Monaco', code: 'MC', flag: '🇲🇨', dialCode: '+377', region: 'Europe' },
    { name: 'Morocco', code: 'MA', flag: '🇲🇦', dialCode: '+212', region: 'Africa' },
    { name: 'Netherlands', code: 'NL', flag: '🇳🇱', dialCode: '+31', region: 'Europe' },
    { name: 'New Zealand', code: 'NZ', flag: '🇳🇿', dialCode: '+64', region: 'Oceania' },
    { name: 'Norway', code: 'NO', flag: '🇳🇴', dialCode: '+47', region: 'Europe' },
    { name: 'Oman', code: 'OM', flag: '🇴🇲', dialCode: '+968', region: 'Middle East' },
    { name: 'Pakistan', code: 'PK', flag: '🇵🇰', dialCode: '+92', region: 'Asia' },
    { name: 'Panama', code: 'PA', flag: '🇵🇦', dialCode: '+507', region: 'Americas' },
    { name: 'Peru', code: 'PE', flag: '🇵🇪', dialCode: '+51', region: 'Americas' },
    { name: 'Philippines', code: 'PH', flag: '🇵🇭', dialCode: '+63', region: 'Asia' },
    { name: 'Poland', code: 'PL', flag: '🇵🇱', dialCode: '+48', region: 'Europe' },
    { name: 'Portugal', code: 'PT', flag: '🇵🇹', dialCode: '+351', region: 'Europe' },
    { name: 'Qatar', code: 'QA', flag: '🇶🇦', dialCode: '+974', region: 'Middle East' },
    { name: 'Romania', code: 'RO', flag: '🇷🇴', dialCode: '+40', region: 'Europe' },
    { name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦', dialCode: '+966', region: 'Middle East' },
    { name: 'South Africa', code: 'ZA', flag: '🇿🇦', dialCode: '+27', region: 'Africa' },
    { name: 'South Korea', code: 'KR', flag: '🇰🇷', dialCode: '+82', region: 'Asia' },
    { name: 'Spain', code: 'ES', flag: '🇪🇸', dialCode: '+34', region: 'Europe' },
    { name: 'Sri Lanka', code: 'LK', flag: '🇱🇰', dialCode: '+94', region: 'Asia' },
    { name: 'Sweden', code: 'SE', flag: '🇸🇪', dialCode: '+46', region: 'Europe' },
    { name: 'Switzerland', code: 'CH', flag: '🇨🇭', dialCode: '+41', region: 'Europe' },
    { name: 'Thailand', code: 'TH', flag: '🇹🇭', dialCode: '+66', region: 'Asia' },
    { name: 'Trinidad and Tobago', code: 'TT', flag: '🇹🇹', dialCode: '+1', region: 'Americas' },
    { name: 'Turkey', code: 'TR', flag: '🇹🇷', dialCode: '+90', region: 'Europe' },
    { name: 'Ukraine', code: 'UA', flag: '🇺🇦', dialCode: '+380', region: 'Europe' },
    { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', dialCode: '+971', region: 'Middle East' },
    { name: 'Uruguay', code: 'UY', flag: '🇺🇾', dialCode: '+598', region: 'Americas' },
    { name: 'Vietnam', code: 'VN', flag: '🇻🇳', dialCode: '+84', region: 'Asia' },
    { name: 'Other International', code: 'INT', flag: '🌐', dialCode: '+1', region: 'Global' }
];

export const getCountryRequirements = (country: string): CountryConfig => {
    if (COUNTRY_REQUIREMENTS[country]) {
        return COUNTRY_REQUIREMENTS[country];
    }
    
    // Check if country exists in master ALL_COUNTRIES list
    const found = ALL_COUNTRIES.find(c => c.name.toLowerCase() === country.toLowerCase() || c.code.toLowerCase() === country.toLowerCase());
    if (found) {
        return {
            name: found.name,
            code: found.code,
            flag: found.flag,
            dialCode: found.dialCode,
            addressLabels: {
                street: 'Residential Street Address *',
                apartment: 'Apartment / Suite / Unit',
                city: 'City / Municipality *',
                state: 'Province / State / Region *',
                statePlaceholder: `e.g. Province or Region in ${found.name}`,
                postalCode: 'Postal / ZIP Code *',
                postalCodePlaceholder: 'e.g. Postal Code'
            },
            idTypes: [
                { label: `${found.name} National Passport`, value: `${found.name} Passport` },
                { label: `${found.name} National Identity Card`, value: `${found.name} National ID` },
                { label: `${found.name} Driver's License`, value: `${found.name} Driver's License` },
                { label: 'Government Photo Credential', value: 'Government Photo Credential' }
            ],
            taxId: {
                typeLabel: `${found.name} Tax ID / National Number *`,
                types: [
                    'Tax Identification Number (TIN)',
                    'National Citizen Identification Number'
                ],
                inputLabel: 'Tax ID or National Identification Number *',
                placeholder: `Enter your ${found.name} tax or personal ID`,
                complianceNotice: `Compliant with standard OECD Common Reporting Standard (CRS) and statutory KYC regulations for ${found.name} banking clients.`
            }
        };
    }

    return COUNTRY_REQUIREMENTS['United States'];
};
