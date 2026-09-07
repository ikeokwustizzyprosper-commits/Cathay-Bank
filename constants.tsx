
import React from 'react';
import { User, Transaction, Card, Notification } from './types';

export const EXCHANGE_RATES: Record<string, number> = {
    'GBP': 1.0,
    'USD': 1.28,
    'SAR': 4.81,
    'PHP': 74.62,
    'EUR': 1.18,
    'AED': 4.71,
    'CAD': 1.74,
    'AUD': 1.94,
    'SGD': 1.72,
    'CNY': 9.28,
    'JPY': 200.58,
    'INR': 106.85,
    'NGN': 1948.72,
    'ZAR': 23.65,
    'BRL': 6.91,
    'MXN': 22.85,
    'EGP': 60.54,
    'TRY': 41.15,
    'ARS': 1160.26,
    'SYP': 16666.67,
    'CLP': 339.44,
    'VES': 46.54,
    'RUB': 118.59,
    'KRW': 1717.95,
    'CHF': 1.14,
    'SEK': 13.46,
    'NOK': 13.72,
    'DKK': 8.78,
    'NZD': 2.12,
    'HKD': 10.03,
    'MYR': 6.03,
    'THB': 46.79,
    'IDR': 20512.82,
    'ILS': 4.74,
    'PLN': 5.06,
    'CZK': 29.74,
    'HUF': 461.54,
    'RON': 5.90,
    'COP': 5000.00,
    'PEN': 4.74,
    'UAH': 50.64,
    'KZT': 570.51,
    'QAR': 4.67,
    'KWD': 0.40,
    'OMR': 0.49,
    'BHD': 0.49,
    'JOD': 0.91,
    'LBP': 114743.59,
    'IQD': 1679.49,
    'PKR': 356.41,
    'BDT': 150.00,
    'VND': 32628.21,
    'GHS': 18.59,
    'KES': 166.67,
    'UGX': 4807.69,
    'TZS': 3333.33,
    'ETB': 73.08,
    'MAD': 12.82,
    'TND': 3.97,
    'DZD': 171.79,
    'TJS': 13.59,
    'AZN': 2.18,
    'GEL': 3.46,
    'AMD': 497.44,
    'UZS': 16153.85,
    'KGS': 114.10,
    'MNT': 4384.62,
    'LAK': 28205.13,
    'MMK': 2692.31,
    'KHR': 5256.41,
    'NPR': 171.79,
    'LKR': 384.62,
    'MVR': 19.74,
    'AFN': 91.03,
    'BND': 1.72,
    'FJD': 2.88,
    'XPF': 141.03,
    'WST': 3.53,
    'TOP': 3.01,
    'VUV': 153.85,
    'SBD': 10.90,
    'PGK': 4.97,
    'MUR': 58.97,
    'SCR': 17.69,
    'MGA': 5897.44,
    'MWK': 2243.59,
    'ZMW': 33.33,
    'NAD': 23.65,
    'BWP': 17.31,
    'SZL': 23.65,
    'LSL': 23.65,
    'MZN': 81.67,
    'AOA': 1076.92,
    'CDF': 3589.74,
    'RWF': 1666.67,
    'BIF': 3653.85,
    'SDG': 769.23,
    'SSP': 1666.67,
    'ERN': 19.23,
    'DJF': 228.21,
    'SOS': 730.77,
    'LYD': 6.15,
    'TWD': 41.15,
    'MOP': 10.33,
    'DOP': 76.20,
    'CRC': 658.00,
    'JMD': 200.00,
    'TTD': 8.68,
    'BBD': 2.56,
    'XCD': 3.46,
    'ISK': 175.50,
    'BAM': 2.31,
    'ALL': 116.50,
    'MKD': 72.60,
    'RSD': 138.20,
    'BGN': 2.31,
    'MDL': 22.70,
    'UYU': 51.80,
    'PYG': 9750.00,
    'BOB': 8.85,
};

export const COUNTRIES_WITH_BANKS = [
    { name: "Syria", currency: "SYP", banks: ["Commercial Bank of Syria", "Real Estate Bank of Syria", "Industrial Bank", "Popular Credit Bank", "Agricultural Cooperative Bank", "Saving Bank", "Bank of Syria and Overseas", "Banque Bemo Saudi Fransi", "Cham Bank", "Syria International Islamic Bank", "Al-Baraka Bank Syria"] },
    { name: "United States", currency: "USD", banks: ["Cathay Bank", "Cathay Bank USA", "Bank of America", "JPMorgan Chase", "Wells Fargo", "Citibank", "Capital One", "PNC Bank", "U.S. Bank", "TD Bank USA", "Goldman Sachs", "Morgan Stanley", "Charles Schwab Bank", "Trust Financial"] },
    { name: "United Arab Emirates", currency: "AED", banks: ["First Abu Dhabi Bank", "Emirates NBD", "ADCB", "Mashreq Bank"] },
    { name: "Argentina", currency: "ARS", banks: ["Banco de la Nación Argentina", "Banco Santander Argentina", "Banco Galicia", "BBVA Argentina", "Banco Macro", "HSBC Argentina", "Banco Provincia"] },
    { name: "United Kingdom", currency: "GBP", banks: ["Cathay Bank UK", "Cathay Bank", "Barclays", "HSBC UK", "Lloyds Bank", "NatWest", "Standard Chartered", "Santander UK", "Monzo Bank", "Revolut UK", "Metro Bank", "Starling Bank"] },
    { name: "Saudi Arabia", currency: "SAR", banks: ["Saudi National Bank (SNB)", "Al-Rajhi Bank", "Riyad Bank", "Alinma Bank", "Banque Saudi Fransi", "STC Pay", "Urpay"] },
    { name: "Philippines", currency: "PHP", banks: ["BDO Unibank", "BPI", "Metrobank", "Landbank", "Security Bank", "GCash", "Maya"] },
    { name: "Canada", currency: "CAD", banks: ["RBC", "TD", "Scotiabank", "BMO", "CIBC"] },
    { name: "Australia", currency: "AUD", banks: ["Commonwealth Bank", "Westpac", "ANZ", "NAB"] },
    { name: "Singapore", currency: "SGD", banks: ["DBS", "OCBC", "UOB"] },
    { name: "China", currency: "CNY", banks: ["ICBC", "CCB", "Alipay", "WeChat Pay", "Bank of China"] },
    { name: "France", currency: "EUR", banks: ["BNP Paribas", "Société Générale", "Crédit Agricole"] },
    { name: "Germany", currency: "EUR", banks: ["Deutsche Bank", "Commerzbank", "N26"] },
    { name: "Japan", currency: "JPY", banks: ["MUFG", "SMBC", "Mizuho"] },
    { name: "India", currency: "INR", banks: ["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank"] },
    { name: "Nigeria", currency: "NGN", banks: ["Zenith Bank", "GTBank", "Access Bank", "First Bank", "UBA"] },
    { name: "South Africa", currency: "ZAR", banks: ["Standard Bank", "FirstRand", "Absa", "Nedbank"] },
    { name: "Brazil", currency: "BRL", banks: ["Itaú Unibanco", "Bradesco", "Banco do Brasil", "Nubank"] },
    { name: "Egypt", currency: "EGP", banks: ["National Bank of Egypt", "Banque Misr", "CIB"] },
    { name: "Turkey", currency: "TRY", banks: ["Ziraat Bank", "İşbank", "Garanti BBVA"] },
    { name: "Switzerland", currency: "CHF", banks: ["UBS", "Credit Suisse", "Raiffeisen", "Zürcher Kantonalbank"] },
    { name: "Italy", currency: "EUR", banks: ["Intesa Sanpaolo", "UniCredit", "Poste Italiane"] },
    { name: "Spain", currency: "EUR", banks: ["Banco Santander", "BBVA", "CaixaBank"] },
    { name: "Netherlands", currency: "EUR", banks: ["ING Group", "Rabobank", "ABN AMRO"] },
    { name: "South Korea", currency: "KRW", banks: ["KB Financial Group", "Shinhan Financial Group", "Hana Financial Group"] },
    { name: "Israel", currency: "ILS", banks: ["Bank Leumi", "Bank Hapoalim", "Israel Discount Bank"] },
    { name: "Russia", currency: "RUB", banks: ["Sberbank", "VTB Bank", "Gazprombank"] },
    { name: "Sweden", currency: "SEK", banks: ["Svenska Handelsbanken", "Swedbank", "SEB"] },
    { name: "Norway", currency: "NOK", banks: ["DNB", "SpareBank 1", "Nordea"] },
    { name: "Denmark", currency: "DKK", banks: ["Danske Bank", "Jyske Bank", "Nordea"] },
    { name: "Chile", currency: "CLP", banks: ["Banco de Chile", "Banco Santander Chile", "Banco Estado"] },
    { name: "Venezuela", currency: "VES", banks: ["Banco de Venezuela", "Banesco", "Banco Mercantil"] },
    { name: "Pakistan", currency: "PKR", banks: ["Habib Bank", "National Bank of Pakistan", "United Bank", "MCB Bank"] },
    { name: "Bangladesh", currency: "BDT", banks: ["Sonali Bank", "Janata Bank", "Agrani Bank", "Dutch-Bangla Bank"] },
    { name: "Vietnam", currency: "VND", banks: ["Vietcombank", "VietinBank", "BIDV", "Agribank"] },
    { name: "Ghana", currency: "GHS", banks: ["GCB Bank", "Ecobank Ghana", "Stanbic Bank Ghana"] },
    { name: "Kenya", currency: "KES", banks: ["KCB Bank", "Equity Bank", "Co-operative Bank of Kenya"] },
    { name: "Uganda", currency: "UGX", banks: ["Stanbic Bank Uganda", "Centenary Bank", "Standard Chartered Uganda"] },
    { name: "Tanzania", currency: "TZS", banks: ["CRDB Bank", "NMB Bank", "NBC Bank"] },
    { name: "Ethiopia", currency: "ETB", banks: ["Commercial Bank of Ethiopia", "Awash Bank", "Dashen Bank"] },
    { name: "Morocco", currency: "MAD", banks: ["Attijariwafa Bank", "Banque Populaire", "BMCE Bank"] },
    { name: "Tunisia", currency: "TND", banks: ["Banque Internationale Arabe de Tunisie", "Banque Nationale Agricole"] },
    { name: "Algeria", currency: "DZD", banks: ["Banque Nationale d'Algérie", "Crédit Populaire d'Algérie"] },
    { name: "Jordan", currency: "JOD", banks: ["Arab Bank", "Housing Bank for Trade and Finance"] },
    { name: "Lebanon", currency: "LBP", banks: ["Bank Audi", "BLOM Bank", "Byblos Bank"] },
    { name: "Iraq", currency: "IQD", banks: ["Rafidain Bank", "Rasheed Bank", "Trade Bank of Iraq"] },
    { name: "Kuwait", currency: "KWD", banks: ["National Bank of Kuwait", "Kuwait Finance House"] },
    { name: "Qatar", currency: "QAR", banks: ["Qatar National Bank", "Qatar Islamic Bank", "Doha Bank"] },
    { name: "Bahrain", currency: "BHD", banks: ["Ahli United Bank", "National Bank of Bahrain"] },
    { name: "Oman", currency: "OMR", banks: ["Bank Muscat", "National Bank of Oman"] },
    { name: "New Zealand", currency: "NZD", banks: ["ANZ New Zealand", "ASB Bank", "Westpac NZ", "BNZ", "Kiwibank"] },
    { name: "Hong Kong", currency: "HKD", banks: ["HSBC HK", "Standard Chartered HK", "Hang Seng Bank", "Bank of China HK", "Citi HK"] },
    { name: "Malaysia", currency: "MYR", banks: ["Maybank", "CIMB Bank", "Public Bank", "RHB Bank", "Hong Leong Bank"] },
    { name: "Thailand", currency: "THB", banks: ["Siam Commercial Bank", "Kasikornbank", "Bangkok Bank", "Krungthai Bank", "TMBThanachart"] },
    { name: "Indonesia", currency: "IDR", banks: ["Bank Mandiri", "Bank Central Asia (BCA)", "Bank Rakyat Indonesia (BRI)", "Bank Negara Indonesia (BNI)"] },
    { name: "Poland", currency: "PLN", banks: ["PKO Bank Polski", "Bank Pekao", "Santander Bank Polska", "mBank", "ING Bank Śląski"] },
    { name: "Czech Republic", currency: "CZK", banks: ["Česká spořitelna", "ČSOB", "Komerční banka", "Raiffeisenbank"] },
    { name: "Hungary", currency: "HUF", banks: ["OTP Bank", "K&H Bank", "MBH Bank", "Erste Bank"] },
    { name: "Romania", currency: "RON", banks: ["Banca Transilvania", "BCR", "BRD Groupe Société Générale", "ING Bank Romania"] },
    { name: "Colombia", currency: "COP", banks: ["Bancolombia", "Banco de Bogotá", "Davivienda", "BBVA Colombia"] },
    { name: "Peru", currency: "PEN", banks: ["BCP", "BBVA Perú", "Interbank", "Scotiabank Perú"] },
    { name: "Ukraine", currency: "UAH", banks: ["PrivatBank", "Oschadbank", "Raiffeisen Bank", "Ukrsibbank", "Monobank"] },
    { name: "Kazakhstan", currency: "KZT", banks: ["Kaspi Bank", "Halyk Bank", "ForteBank", "Jusan Bank"] },
    { name: "Tajikistan", currency: "TJS", banks: ["Orienbank", "Amonatbonk", "Tojik Sodirot Bank", "Spitamen Bank"] },
    { name: "Azerbaijan", currency: "AZN", banks: ["International Bank of Azerbaijan", "Kapital Bank", "PASHA Bank", "Xalq Bank"] },
    { name: "Georgia", currency: "GEL", banks: ["Bank of Georgia", "TBC Bank", "Liberty Bank", "BasisBank"] },
    { name: "Armenia", currency: "AMD", banks: ["Ameriabank", "Ardshinbank", "Acba Bank", "Converse Bank"] },
    { name: "Uzbekistan", currency: "UZS", banks: ["National Bank of Uzbekistan", "Asakabank", "Ipoteka Bank", "SQB"] },
    { name: "Kyrgyzstan", currency: "KGS", banks: ["Optima Bank", "Demir Bank", "RSK Bank", "Aiyl Bank"] },
    { name: "Mongolia", currency: "MNT", banks: ["Khan Bank", "Golomt Bank", "Trade and Development Bank", "State Bank"] },
    { name: "Laos", currency: "LAK", banks: ["BCEL", "Joint Development Bank", "Lao Development Bank", "Banque Franco-Lao"] },
    { name: "Myanmar", currency: "MMK", banks: ["KBZ Bank", "CB Bank", "AYA Bank", "Yoma Bank"] },
    { name: "Cambodia", currency: "KHR", banks: ["ABA Bank", "Acleda Bank", "Canadia Bank", "Sathapana Bank"] },
    { name: "Nepal", currency: "NPR", banks: ["Nabil Bank", "Nepal Investment Mega Bank", "Global IME Bank", "Rastriya Banijya Bank"] },
    { name: "Maldives", currency: "MVR", banks: ["Bank of Maldives", "State Bank of India Maldives", "Maldives Islamic Bank"] },
    { name: "Afghanistan", currency: "AFN", banks: ["Da Afghanistan Bank", "Kabul Bank", "Azizi Bank", "Pashtany Bank"] },
    { name: "Brunei", currency: "BND", banks: ["BIBD", "Baiduri Bank", "Standard Chartered Brunei"] },
    { name: "Fiji", currency: "FJD", banks: ["ANZ Fiji", "Westpac Fiji", "Bank of Baroda Fiji", "BSP Fiji"] },
    { name: "French Polynesia", currency: "XPF", banks: ["Banque de Polynésie", "Banque de Tahiti", "Sogebank"] },
    { name: "Samoa", currency: "WST", banks: ["BSP Samoa", "ANZ Samoa", "National Bank of Samoa"] },
    { name: "Tonga", currency: "TOP", banks: ["BSP Tonga", "ANZ Tonga", "Tonga Development Bank"] },
    { name: "Vanuatu", currency: "VUV", banks: ["BSP Vanuatu", "ANZ Vanuatu", "National Bank of Vanuatu"] },
    { name: "Solomon Islands", currency: "SBD", banks: ["BSP Solomon Islands", "ANZ Solomon Islands", "Pan Oceanic Bank"] },
    { name: "Papua New Guinea", currency: "PGK", banks: ["BSP PNG", "Kina Bank", "Westpac PNG"] },
    { name: "Mauritius", currency: "MUR", banks: ["MCB", "SBM", "Absa Mauritius", "MauBank"] },
    { name: "Seychelles", currency: "SCR", banks: ["MCB Seychelles", "Absa Seychelles", "Nouvobanq"] },
    { name: "Madagascar", currency: "MGA", banks: ["BMOI", "BNI Madagascar", "Société Générale Madagasikara", "Bank of Africa Madagascar"] },
    { name: "Malawi", currency: "MWK", banks: ["National Bank of Malawi", "Standard Bank Malawi", "FDH Bank"] },
    { name: "Zambia", currency: "ZMW", banks: ["Zanaco", "Stanbic Bank Zambia", "Atlas Mara Zambia", "Absa Zambia"] },
    { name: "Namibia", currency: "NAD", banks: ["First National Bank Namibia", "Bank Windhoek", "Nedbank Namibia", "Standard Bank Namibia"] },
    { name: "Botswana", currency: "BWP", banks: ["FNBB", "Standard Chartered Botswana", "Absa Botswana", "Stanbic Bank Botswana"] },
    { name: "Eswatini", currency: "SZL", banks: ["FNB Eswatini", "Standard Bank Eswatini", "Nedbank Eswatini"] },
    { name: "Lesotho", currency: "LSL", banks: ["FNB Lesotho", "Standard Lesotho Bank", "Nedbank Lesotho"] },
    { name: "Mozambique", currency: "MZN", banks: ["Millennium bim", "BCI", "Standard Bank Moçambique"] },
    { name: "Angola", currency: "AOA", banks: ["BAI", "BFA", "Banco BIC", "Standard Bank Angola"] },
    { name: "DR Congo", currency: "CDF", banks: ["Rawbank", "TMB", "Equity BCDC", "Access Bank DR Congo"] },
    { name: "Rwanda", currency: "RWF", banks: ["Bank of Kigali", "I&M Bank Rwanda", "Equity Bank Rwanda", "Cogebanque"] },
    { name: "Burundi", currency: "BIF", banks: ["Banque de la République du Burundi", "Interbank Burundi", "CRDB Burundi"] },
    { name: "Sudan", currency: "SDG", banks: ["Bank of Khartoum", "Faisal Islamic Bank", "Omdurman National Bank"] },
    { name: "South Sudan", currency: "SSP", banks: ["Bank of South Sudan", "Equity Bank South Sudan", "KCB South Sudan"] },
    { name: "Eritrea", currency: "ERN", banks: ["Commercial Bank of Eritrea", "Housing and Commerce Bank"] },
    { name: "Djibouti", currency: "DJF", banks: ["CAC Bank", "Bank of Africa Djibouti", "Exim Bank Djibouti"] },
    { name: "Somalia", currency: "SOS", banks: ["Premier Bank", "IBS Bank", "Salaam Somali Bank", "Amal Bank"] },
    { name: "Libya", currency: "LYD", banks: ["Jumhouria Bank", "National Commercial Bank Libya", "Wahda Bank"] },
    { name: "Taiwan", currency: "TWD", banks: ["Bank of Taiwan", "CTBC Bank", "Cathay United Bank", "First Commercial Bank", "Taipei Fubon Bank", "Mega International Commercial Bank"] },
    { name: "Macao", currency: "MOP", banks: ["Bank of China Macao", "Tai Fung Bank", "ICBC Macao", "BCM Bank"] },
    { name: "Dominican Republic", currency: "DOP", banks: ["Banco Popular Dominicano", "Banreservas", "Banco BHD"] },
    { name: "Costa Rica", currency: "CRC", banks: ["Banco Nacional de Costa Rica", "Banco de Costa Rica", "BAC Credomatic"] },
    { name: "Jamaica", currency: "JMD", banks: ["National Commercial Bank Jamaica", "Scotiabank Jamaica", "Sagicor Bank"] },
    { name: "Trinidad and Tobago", currency: "TTD", banks: ["Republic Bank", "FCB Trinidad", "Scotiabank Trinidad"] },
    { name: "Barbados", currency: "BBD", banks: ["FCIB Barbados", "Republic Bank Barbados", "Scotiabank Barbados"] },
    { name: "Iceland", currency: "ISK", banks: ["Landsbankinn", "Arion banki", "Íslandsbanki"] },
    { name: "Albania", currency: "ALL", banks: ["Banka Kombëtare Tregtare", "Credins Bank", "Raiffeisen Bank Albania"] },
    { name: "Serbia", currency: "RSD", banks: ["Banca Intesa Beograd", "OTP Banka Srbija", "NLB Komercijalna banka"] },
    { name: "Bulgaria", currency: "BGN", banks: ["UniCredit Bulbank", "DSK Bank", "United Bulgarian Bank"] },
    { name: "Uruguay", currency: "UYU", banks: ["Banco República", "Banco Santander Uruguay", "BBVA Uruguay"] },
    { name: "Paraguay", currency: "PYG", banks: ["Banco Continental", "Itaú Paraguay", "Sudameris Bank"] },
    { name: "Bolivia", currency: "BOB", banks: ["Banco Mercantil Santa Cruz", "Banco Nacional de Bolivia", "Banco BISA"] },
    { name: "Belgium", currency: "EUR", banks: ["KBC Bank", "BNP Paribas Fortis", "Belfius", "ING Belgium"] },
    { name: "Austria", currency: "EUR", banks: ["Erste Bank", "Raiffeisen Bank Austria", "UniCredit Bank Austria"] },
    { name: "Portugal", currency: "EUR", banks: ["Caixa Geral de Depósitos", "Millennium BCP", "Banco Totta", "Novo Banco"] },
    { name: "Greece", currency: "EUR", banks: ["Piraeus Bank", "National Bank of Greece", "Alpha Bank", "Eurobank"] },
    { name: "Ireland", currency: "EUR", banks: ["Bank of Ireland", "AIB", "Permanent TSB"] },
    { name: "Finland", currency: "EUR", banks: ["Nordea Finland", "OP Financial Group", "Danske Bank Finland"] },
];

export const CURRENCY_DATA = [
    { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
    { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
    { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
    { code: "SAR", symbol: "﷼", name: "Saudi Riyal", flag: "🇸🇦" },
    { code: "AED", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪" },
    { code: "CAD", symbol: "$", name: "Canadian Dollar", flag: "🇨🇦" },
    { code: "AUD", symbol: "$", name: "Australian Dollar", flag: "🇦🇺" },
    { code: "CHF", symbol: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan", flag: "🇨🇳" },
    { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
    { code: "BRL", symbol: "R$", name: "Brazilian Real", flag: "🇧🇷" },
    { code: "MXN", symbol: "$", name: "Mexican Peso", flag: "🇲🇽" },
    { code: "SGD", symbol: "$", name: "Singapore Dollar", flag: "🇸🇬" },
    { code: "NZD", symbol: "$", name: "New Zealand Dollar", flag: "🇳🇿" },
    { code: "HKD", symbol: "$", name: "Hong Kong Dollar", flag: "🇭🇰" },
    { code: "KRW", symbol: "₩", name: "South Korean Won", flag: "🇰🇷" },
    { code: "SEK", symbol: "kr", name: "Swedish Krona", flag: "🇸🇪" },
    { code: "NOK", symbol: "kr", name: "Norwegian Krone", flag: "🇳🇴" },
    { code: "DKK", symbol: "kr", name: "Danish Krone", flag: "🇩🇰" },
    { code: "PLN", symbol: "zł", name: "Polish Zloty", flag: "🇵🇱" },
    { code: "TRY", symbol: "₺", name: "Turkish Lira", flag: "🇹🇷" },
    { code: "ZAR", symbol: "R", name: "South African Rand", flag: "🇿🇦" },
    { code: "NGN", symbol: "₦", name: "Nigerian Naira", flag: "🇳🇬" },
    { code: "EGP", symbol: "E£", name: "Egyptian Pound", flag: "🇪🇬" },
    { code: "PHP", symbol: "₱", name: "Philippine Peso", flag: "🇵🇭" },
    { code: "THB", symbol: "฿", name: "Thai Baht", flag: "🇹🇭" },
    { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", flag: "🇮🇩" },
    { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", flag: "🇲🇾" },
    { code: "VND", symbol: "₫", name: "Vietnamese Dong", flag: "🇻🇳" },
    { code: "PKR", symbol: "Rs", name: "Pakistani Rupee", flag: "🇵🇰" },
    { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", flag: "🇧🇩" },
    { code: "ILS", symbol: "₪", name: "Israeli Shekel", flag: "🇮🇱" },
    { code: "QAR", symbol: "﷼", name: "Qatari Riyal", flag: "🇶🇦" },
    { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar", flag: "🇰🇼" },
    { code: "OMR", symbol: "﷼", name: "Omani Rial", flag: "🇴🇲" },
    { code: "BHD", symbol: ".د.ب", name: "Bahraini Dinar", flag: "🇧🇭" },
    { code: "JOD", symbol: "JD", name: "Jordanian Dinar", flag: "🇯🇴" },
    { code: "ARS", symbol: "$", name: "Argentine Peso", flag: "🇦🇷" },
    { code: "CLP", symbol: "$", name: "Chilean Peso", flag: "🇨🇱" },
    { code: "COP", symbol: "$", name: "Colombian Peso", flag: "🇨🇴" },
    { code: "PEN", symbol: "S/", name: "Peruvian Sol", flag: "🇵🇪" },
    { code: "VES", symbol: "Bs.", name: "Venezuelan Bolívar", flag: "🇻🇪" },
    { code: "RUB", symbol: "₽", name: "Russian Ruble", flag: "🇷🇺" },
    { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia", flag: "🇺🇦" },
    { code: "CZK", symbol: "Kč", name: "Czech Koruna", flag: "🇨🇿" },
    { code: "HUF", symbol: "Ft", name: "Hungarian Forint", flag: "🇭🇺" },
    { code: "RON", symbol: "lei", name: "Romanian Leu", flag: "🇷🇴" },
    { code: "KZT", symbol: "₸", name: "Kazakhstani Tenge", flag: "🇰🇿" },
    { code: "SYP", symbol: "£S", name: "Syrian Pound", flag: "🇸🇾" },
    { code: "LBP", symbol: "L£", name: "Lebanese Pound", flag: "🇱🇧" },
    { code: "IQD", symbol: "IQD", name: "Iraqi Dinar", flag: "🇮🇶" },
    { code: "GHS", symbol: "₵", name: "Ghanaian Cedi", flag: "🇬🇭" },
    { code: "KES", symbol: "KSh", name: "Kenyan Shilling", flag: "🇰🇪" },
    { code: "UGX", symbol: "USh", name: "Ugandan Shilling", flag: "🇺🇬" },
    { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling", flag: "🇹🇿" },
    { code: "ETB", symbol: "Br", name: "Ethiopian Birr", flag: "🇪🇹" },
    { code: "MAD", symbol: "DH", name: "Moroccan Dirham", flag: "🇲🇦" },
    { code: "TND", symbol: "DT", name: "Tunisian Dinar", flag: "🇹🇳" },
    { code: "DZD", symbol: "DA", name: "Algerian Dinar", flag: "🇩🇿" },
    { code: "ZMW", symbol: "ZK", name: "Zambian Kwacha", flag: "🇿🇲" },
    { code: "NPR", symbol: "Rs", name: "Nepalese Rupee", flag: "🇳🇵" },
    { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee", flag: "🇱🇰" },
    { code: "MVR", symbol: "Rf", name: "Maldivian Rufiyaa", flag: "🇲🇻" },
    { code: "AFN", symbol: "؋", name: "Afghan Afghani", flag: "🇦🇫" },
    { code: "MMK", symbol: "K", name: "Myanmar Kyat", flag: "🇲🇲" },
    { code: "KHR", symbol: "៛", name: "Cambodian Riel", flag: "🇰🇭" },
    { code: "LAK", symbol: "₭", name: "Lao Kip", flag: "🇱🇦" },
    { code: "MNT", symbol: "₮", name: "Mongolian Tugrik", flag: "🇲🇳" },
    { code: "AZN", symbol: "₼", name: "Azerbaijani Manat", flag: "🇦🇿" },
    { code: "GEL", symbol: "₾", name: "Georgian Lari", flag: "🇬🇪" },
    { code: "AMD", symbol: "֏", name: "Armenian Dram", flag: "🇦🇲" },
    { code: "UZS", symbol: "so'm", name: "Uzbekistani Som", flag: "🇺🇿" },
    { code: "KGS", symbol: "сом", name: "Kyrgyzstani Som", flag: "🇰🇬" },
    { code: "TJS", symbol: "SM", name: "Tajikistani Somoni", flag: "🇹🇯" },
    { code: "MGA", symbol: "Ar", name: "Malagasy Ariary", flag: "🇲🇬" },
    { code: "MUR", symbol: "Rs", name: "Mauritian Rupee", flag: "🇲🇺" },
    { code: "SCR", symbol: "SR", name: "Seychellois Rupee", flag: "🇸🇨" },
    { code: "MWK", symbol: "MK", name: "Malawian Kwacha", flag: "🇲🇼" },
    { code: "NAD", symbol: "N$", name: "Namibian Dollar", flag: "🇳🇦" },
    { code: "BWP", symbol: "P", name: "Botswana Pula", flag: "🇧🇼" },
    { code: "SZL", symbol: "E", name: "Swazi Lilangeni", flag: "🇸🇿" },
    { code: "LSL", symbol: "L", name: "Lesotho Loti", flag: "🇱🇸" },
    { code: "MZN", symbol: "MT", name: "Mozambican Metical", flag: "🇲🇿" },
    { code: "AOA", symbol: "Kz", name: "Angolan Kwanza", flag: "🇦🇴" },
    { code: "CDF", symbol: "FC", name: "Congolese Franc", flag: "🇨🇩" },
    { code: "RWF", symbol: "FRw", name: "Rwandan Franc", flag: "🇷🇼" },
    { code: "BIF", symbol: "FBu", name: "Burundian Franc", flag: "🇧🇮" },
    { code: "SDG", symbol: "SDG", name: "Sudanese Pound", flag: "🇸🇩" },
    { code: "SSP", symbol: "SSP", name: "South Sudanese Pound", flag: "🇸🇸" },
    { code: "SOS", symbol: "Sh.So.", name: "Somali Shilling", flag: "🇸🇴" },
    { code: "LYD", symbol: "LD", name: "Libyan Dinar", flag: "🇱🇾" },
    { code: "BND", symbol: "B$", name: "Brunei Dollar", flag: "🇧🇳" },
    { code: "FJD", symbol: "FJ$", name: "Fijian Dollar", flag: "🇫🇯" },
    { code: "XPF", symbol: "CFP", name: "CFP Franc", flag: "🇵🇫" },
    { code: "WST", symbol: "WS$", name: "Samoan Tala", flag: "🇼🇸" },
    { code: "TOP", symbol: "T$", name: "Tongan Paʻanga", flag: "🇹🇴" },
    { code: "VUV", symbol: "VT", name: "Vanuatu Vatu", flag: "🇻🇺" },
    { code: "SBD", symbol: "SI$", name: "Solomon Islands Dollar", flag: "🇸🇧" },
    { code: "PGK", symbol: "K", name: "Papua New Guinean Kina", flag: "🇵🇬" },
    { code: "TWD", symbol: "NT$", name: "New Taiwan Dollar", flag: "🇹🇼" },
    { code: "MOP", symbol: "MOP$", name: "Macanese Pataca", flag: "🇲🇴" },
    { code: "DOP", symbol: "RD$", name: "Dominican Peso", flag: "🇩🇴" },
    { code: "CRC", symbol: "₡", name: "Costa Rican Colón", flag: "🇨🇷" },
    { code: "JMD", symbol: "J$", name: "Jamaican Dollar", flag: "🇯🇲" },
    { code: "TTD", symbol: "TT$", name: "Trinidad & Tobago Dollar", flag: "🇹🇹" },
    { code: "BBD", symbol: "Bds$", name: "Barbadian Dollar", flag: "🇧🇧" },
    { code: "XCD", symbol: "EC$", name: "East Caribbean Dollar", flag: "🇦🇬" },
    { code: "ISK", symbol: "kr", name: "Icelandic Króna", flag: "🇮🇸" },
    { code: "BAM", symbol: "KM", name: "Bosnia Convertible Mark", flag: "🇧🇦" },
    { code: "ALL", symbol: "L", name: "Albanian Lek", flag: "🇦🇱" },
    { code: "MKD", symbol: "den", name: "Macedonian Denar", flag: "🇲🇰" },
    { code: "RSD", symbol: "din.", name: "Serbian Dinar", flag: "🇷🇸" },
    { code: "BGN", symbol: "lv", name: "Bulgarian Lev", flag: "🇧🇬" },
    { code: "MDL", symbol: "L", name: "Moldovan Leu", flag: "🇲🇩" },
    { code: "UYU", symbol: "$U", name: "Uruguayan Peso", flag: "🇺🇾" },
    { code: "PYG", symbol: "₲", name: "Paraguayan Guaraní", flag: "🇵🇾" },
    { code: "BOB", symbol: "Bs.", name: "Bolivian Boliviano", flag: "🇧🇴" },
];

// --- MOCK CARDS ---
export const MOCK_CARDS_LAZARUS: Card[] = [
    {
        id: 'card_1',
        type: 'physical',
        provider: 'mastercard',
        number: '5578 1234 5678 9740',
        expiry: '12/29',
        cvv: '918',
        holderName: 'Cao Duy',
    },
    {
        id: 'card_2',
        type: 'physical',
        provider: 'visa',
        number: '4532 8812 9001 4242',
        expiry: '08/28',
        cvv: '443',
        holderName: 'Cao Duy',
    }
];

export const MOCK_CARDS_ALEX: Card[] = [
    {
        id: 'card_alex_1',
        type: 'physical',
        provider: 'mastercard',
        number: '5578 1234 5678 9740',
        expiry: '12/29',
        cvv: '918',
        holderName: 'Alex Hoàng Duy',
    },
    {
        id: 'card_alex_2',
        type: 'physical',
        provider: 'visa',
        number: '4532 8812 9001 3412',
        expiry: '08/28',
        cvv: '443',
        holderName: 'Alex Hoàng Duy',
    }
];

export const MOCK_CARDS_ALEX_JEFF: Card[] = [
    {
        id: 'card_alex_jeff_1',
        type: 'physical',
        provider: 'mastercard',
        number: '5578 1234 5678 9741',
        expiry: '12/29',
        cvv: '918',
        holderName: 'Alex Jeff',
    },
    {
        id: 'card_alex_jeff_2',
        type: 'physical',
        provider: 'visa',
        number: '4532 8812 9001 3413',
        expiry: '08/28',
        cvv: '443',
        holderName: 'Alex Jeff',
    }
];

export const MOCK_CARDS_ALEX_CHOI: Card[] = [
    {
        id: 'card_alex_choi_1',
        type: 'physical',
        provider: 'mastercard',
        number: '5578 1234 5678 9742',
        expiry: '12/29',
        cvv: '918',
        holderName: 'Alex Narong Choi',
    },
    {
        id: 'card_alex_choi_2',
        type: 'physical',
        provider: 'visa',
        number: '4532 8812 9001 3414',
        expiry: '08/28',
        cvv: '443',
        holderName: 'Alex Narong Choi',
    }
];

export const MOCK_CARDS_JOSEPH = MOCK_CARDS_LAZARUS;

export const MOCK_CARDS_JALIHA: Card[] = [
    {
        id: 'card_j_1',
        type: 'physical',
        provider: 'visa',
        number: '4111 2222 3333 4444',
        expiry: '10/27',
        cvv: '555',
        holderName: 'jaliha Amat Cadir',
    }
];

export const MOCK_CARDS_PARADISE: Card[] = [
    {
        id: 'card_p_1',
        type: 'physical',
        provider: 'visa',
        number: '4455 6677 8899 0011',
        expiry: '05/30',
        cvv: '121',
        holderName: 'Paradise Pollen (Surgery Doctor Gistr3)',
    }
];

export const MOCK_CARDS = MOCK_CARDS_JOSEPH; // For backward compatibility if any

const MOCK_NAMES = [
    "Oliver Smith", "George Edwards", "Harry Wilson", "Noah Brown", "Jack Taylor",
    "Leo Davies", "Arthur Evans", "Muhammad Thomas", "Oscar Roberts", "Charlie Johnson",
    "Henry Walker", "Archie Wright", "Theo Robinson", "Freddie Thompson", "James White",
    "Amelia Jones", "Olivia Williams", "Isla Taylor", "Ava Davies", "Mia Evans",
    "Ivy Roberts", "Lily Johnson", "Isabella Walker", "Sophia Wright", "Grace Robinson",
    "Freya Thompson", "Dorothy White", "Rose Thomas", "Willow Edwards", "Sophie Smith",
    "Liam Murphy", "Emma Sullivan", "Noah Walsh", "Olivia O'Brien", "James Byrne",
    "Ava Ryan", "Logan O'Connor", "Sophia O'Neill", "Lucas Kelly", "Mia O'Sullivan",
    "Ethan McCarthy", "Charlotte Doyle", "Mason Kennedy", "Amelia O'Shea", "Jacob Murray",
    "Harper O'Reilly", "Jack O'Flaherty", "Evelyn O'Carroll", "Aiden Sheehan", "Abigail O'Mahony",
    "Benjamin Taylor", "Charlotte Brown", "Daniel Evans", "Emily Fox", "Samuel Green",
    "Chloe Hill", "Joseph Lewis", "Megan Morgan", "Matthew Parker", "Lucy Scott",
    "JPMorgan Chase Bank N.A.", "Barclays Private Wealth Management", "Cathay Bank Treasury Services",
    "Wells Fargo Commercial Clearing", "Citibank N.A. Wire Operations", "Bank of America Remittance",
    "HSBC Global Liquidity Solutions", "Federal Reserve Board Settlement", "Fidelity Institutional Trust",
    "Capital One Commercial Escrow", "Goldman Sachs Execution Vault", "UBS Wealth Management Switzerland"
];

const MOCK_CRYPTO_RECEIVED = [
    { desc: 'Coinbase Custody Deposit (12.5 BTC)', senderName: 'Coinbase Custody Trust', wallet: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', network: 'Bitcoin Network', bank: 'Coinbase Prime' },
    { desc: 'Kraken OTC Liquidity Settlement (45 ETH)', senderName: 'Kraken Institutional OTC', wallet: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', network: 'Ethereum ERC-20', bank: 'Kraken Prime' },
    { desc: 'Circle USDC Treasury Settlement (50,000 USDC)', senderName: 'Circle Internet Financial', wallet: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', network: 'Ethereum ERC-20', bank: 'BNY Mellon' },
    { desc: 'Gemini Institutional Security Vault (25,000 USDT)', senderName: 'Gemini Trust Company', wallet: '0xdac17f958d2ee523a2206206994597c13d831ec7', network: 'Ethereum ERC-20', bank: 'Signature Vault' },
    { desc: 'Binance Pay Liquidity Deposit (18,500 USDT)', senderName: 'Binance Global Vault', wallet: 'TYDzsYUEpvnYmQ8_TRC20_Vault_883', network: 'TRON TRC-20', bank: 'Binance Pay' },
    { desc: 'Solana DeFi Liquidity Yield (320 SOL)', senderName: 'Solana Foundation Vault', wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', network: 'Solana Mainnet', bank: 'Solana Custody' },
    { desc: 'Exodus Multi-Sig Private Wallet Deposit (3.2 BTC)', senderName: 'Exodus Private Vault', wallet: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', network: 'Bitcoin Network', bank: 'Exodus Gateway' },
    { desc: 'MetaMask Web3 Treasury Swap (15,000 USDT)', senderName: 'MetaMask Web3 Vault', wallet: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7', network: 'Arbitrum One', bank: 'MetaMask Treasury' }
];

const MOCK_CRYPTO_SENT = [
    { desc: 'Transfer to Hardware Cold Storage (Ledger Vault)', receiverName: 'Ledger Enterprise Hardware Vault', wallet: '0x3f5CE5FB191039C1742163226801414521360064', network: 'Ethereum ERC-20', bank: 'Hardware Vault' },
    { desc: 'Coinbase Prime OTC Liquidity Outflow (50,000 USDC)', receiverName: 'Coinbase Custody Trust', wallet: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', network: 'Ethereum ERC-20', bank: 'Coinbase Prime' },
    { desc: 'Outbound Transfer to Binance Trading Wallet (20,000 USDT)', receiverName: 'Binance Exchange Vault', wallet: 'TQn9Y2khEsLJW1ChVWFMSMeSTow5KcbLSE', network: 'TRON TRC-20', bank: 'Binance Exchange' },
    { desc: 'Outbound Transfer to Trust Wallet Vault (1.8 BTC)', receiverName: 'Trust Wallet Vault', wallet: '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo', network: 'Bitcoin Network', bank: 'Trust Wallet' },
    { desc: 'Outbound Transfer to MetaMask Hardware Ledger (30 ETH)', receiverName: 'MetaMask Hardware Vault', wallet: '0x00000000219ab540356cBB839Cbe05303d7705Fa', network: 'Ethereum ERC-20', bank: 'MetaMask Ledger' },
    { desc: 'Outbound Transfer to Phantom Solana Wallet (210 SOL)', receiverName: 'Phantom Solana Vault', wallet: '2wmVL3A2HD8au2GDYi27xLooQ1369EpY45e73yM2G5x8', network: 'Solana Mainnet', bank: 'Phantom Storage' }
];

const generateMockTransactions = (
    userName: string, 
    userAccount: string, 
    count: number = 150,
    airportDate: string = '2026-05-09T14:30:00Z',
    airportAmount: number = 1389,
    maxHistoryDate: Date = new Date(2026, 4, 8), // Defaults to May 8th
    airportName: string = 'Heathrow Airport Ltd',
    airportCountry: string = 'United Kingdom',
    airportCurrency: string = 'GBP',
    airportDesc: string = 'Transfer to Heathrow Airport',
    airportAccount: string = 'UK-AUTH-882299',
    airportBank: string = 'Barclays Bank'
): Transaction[] => {
    const txns: Transaction[] = [];
    
    // The specific Airport transaction
    txns.push({
        id: `txn_${userName.toLowerCase().split(' ')[0]}_latest_airport`,
        date: airportDate,
        description: airportDesc,
        amount: airportAmount,
        type: 'debit',
        category: 'Travel',
        status: 'Completed',
        reference: `APT-WIRE-${Math.floor(Math.random() * 900000 + 100000)}`,
        senderName: userName,
        senderAccount: userAccount,
        receiverName: airportName,
        receiverAccount: airportAccount,
        bankName: airportBank,
        country: airportCountry,
        currency: airportCurrency
    });

    for (let i = 0; i < count - 1; i++) {
        const start = new Date(2023, 0, 1).getTime();
        const end = maxHistoryDate.getTime();
        const date = new Date(start + Math.random() * (end - start));
        
        const isCredit = Math.random() > 0.4;
        const name = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
        const amount = Number((Math.random() * 8000 + 100).toFixed(2));

        // Inject realistic crypto wallet transactions every ~6 iterations
        if (i % 6 === 0) {
            if (isCredit) {
                const cItem = MOCK_CRYPTO_RECEIVED[i % MOCK_CRYPTO_RECEIVED.length];
                txns.push({
                    id: `txn_${userName.toLowerCase().split(' ')[0]}_crypto_in_${i}`,
                    date: date.toISOString(),
                    description: cItem.desc,
                    amount: Number((Math.random() * 25000 + 1000).toFixed(2)),
                    type: 'credit',
                    category: 'Crypto Received',
                    status: 'Completed',
                    reference: `TXHASH-${Math.floor(Math.random() * 899999 + 100000)}`,
                    senderName: cItem.senderName,
                    senderAccount: cItem.wallet,
                    receiverName: userName,
                    receiverAccount: userAccount,
                    bankName: cItem.bank,
                    country: 'Global Decentralized Network',
                    currency: 'USD',
                    subtitle: `Wallet: ${cItem.wallet.slice(0, 10)}... • Net: ${cItem.network}`
                });
            } else {
                const cItem = MOCK_CRYPTO_SENT[i % MOCK_CRYPTO_SENT.length];
                txns.push({
                    id: `txn_${userName.toLowerCase().split(' ')[0]}_crypto_out_${i}`,
                    date: date.toISOString(),
                    description: cItem.desc,
                    amount: -Number((Math.random() * 15000 + 800).toFixed(2)),
                    type: 'debit',
                    category: 'Crypto Sent',
                    status: 'Completed',
                    reference: `TXHASH-${Math.floor(Math.random() * 899999 + 100000)}`,
                    senderName: userName,
                    senderAccount: userAccount,
                    receiverName: cItem.receiverName,
                    receiverAccount: cItem.wallet,
                    bankName: cItem.bank,
                    country: 'Global Decentralized Network',
                    currency: 'USD',
                    subtitle: `Wallet: ${cItem.wallet.slice(0, 10)}... • Net: ${cItem.network}`
                });
            }
            continue;
        }
        
        const randomCountryObj = COUNTRIES_WITH_BANKS[Math.floor(Math.random() * COUNTRIES_WITH_BANKS.length)];
        const isInternational = Math.random() > 0.6; // 40% are international
        const country = isInternational ? randomCountryObj.name : 'USA';
        const currency = isInternational ? randomCountryObj.currency : 'USD';
        const bank = isInternational ? randomCountryObj.banks[Math.floor(Math.random() * randomCountryObj.banks.length)] : 'Cathay Bank';

        const refPrefix = isCredit ? 'CR-WIRE' : 'DR-WIRE';
        const refNum = Math.floor(Math.random() * 899999 + 100000);

        txns.push({
            id: `txn_${userName.toLowerCase().split(' ')[0]}_gen_${i}`,
            date: date.toISOString(),
            description: isCredit ? `Transfer from ${name}` : `Transfer to ${name}`,
            amount: amount,
            type: isCredit ? 'credit' : 'debit',
            category: 'Transfer',
            status: 'Completed',
            reference: `${refPrefix}-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${refNum}`,
            senderName: isCredit ? name : userName,
            senderAccount: isCredit ? `ACC-${Math.floor(Math.random()*900000+100000)}` : userAccount,
            receiverName: isCredit ? userName : name,
            receiverAccount: isCredit ? userAccount : `ACC-${Math.floor(Math.random()*900000+100000)}`,
            bankName: bank,
            country: country,
            currency: currency
        });
    }

    return txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const MOCK_TRANSACTIONS: Transaction[] = generateMockTransactions('jaliha Amat Cadir', '9189740050', 150);

const generateThomasTransactions = (): Transaction[] => {
    return generateMockTransactions('Thomas Tyler Christopher', '3492100495', 150);
};

const generateSanchezTransactions = (): Transaction[] => {
    const txns = generateMockTransactions('Cao Duy', '7722994411', 150, '2026-07-06T14:30:00Z', 1389, new Date(2026, 6, 1));
    
    txns.push({
        id: 'txn_necel_laraga_failed',
        date: '2026-07-08T22:06:00Z',
        description: 'International Transfer to Necel Laraga',
        amount: 20000.00,
        type: 'debit',
        category: 'Transfer',
        status: 'Failed',
        reference: 'TXN-NL-998844',
        senderName: 'Cao Duy',
        senderAccount: '2890155789',
        receiverName: 'Necel Laraga',
        receiverAccount: '+63 907 817 4216',
        bankName: 'GCash',
        country: 'Philippines',
        currency: 'GBP',
        paymentMethod: 'GCash',
        failureReason: 'This international transfer could not be completed. No successful transfer has been confirmed. Please review the transaction details or contact support for assistance.'
    });

    txns.push({
        id: 'txn_hilton_kyiv',
        date: '2026-07-08T17:37:00Z',
        description: 'International Transfer to Hilton Kyiv hotel',
        amount: 1500.00,
        type: 'debit',
        category: 'Travel',
        status: 'Failed',
        reference: 'TXN-98274510',
        senderName: 'Cao Duy',
        senderAccount: '2890155789',
        receiverName: 'Hilton Kyiv hotel',
        receiverAccount: '0198805247',
        bankName: 'Ukrsibbank',
        country: 'Ukraine',
        currency: 'GBP',
        fee: 15.00,
        totalDebited: 1515.00,
        amountReceived: 'UAH 77,250.00',
        exchangeRate: '1 GBP = 51.50 UAH',
        failureReason: 'This transaction could not be completed because your account is temporarily restricted due to security & compliance verification requirements. Please contact Customer Support or your Bank Agent.'
    });

    txns.push({
        id: 'txn_sanchez_philippines_globalcash',
        date: '2026-07-05T18:15:00Z',
        description: 'International Debit to Philippines (GCash)',
        amount: 5009.99,
        type: 'debit',
        category: 'a gift to my wife to solve family problems',
        status: 'Pending',
        reference: '5788295780',
        senderName: 'Cao Duy',
        senderAccount: '7722994411',
        receiverName: 'Necel Laraga',
        receiverAccount: 'GCash Wallet (+63 907 817 4216)',
        bankName: 'GCash',
        country: 'Philippines',
        currency: 'GBP',
        subtitle: 'Card Payment – GlobalCash Money Transfer',
        fee: 9.99,
        totalDebited: 5009.99,
        amountReceived: 'PHP 395,000.00',
        exchangeRate: '1 GBP = PHP 79.00',
        paymentMethod: 'Visa Debit ••••4242',
        receivingNetwork: 'GCash Wallet',
        estimatedDelivery: '7 July 2026'
    });

    txns.push({
        id: 'txn_sanchez_walmart_july4',
        date: '2026-07-04T12:00:00Z',
        description: 'Transfer to Walmart',
        amount: 578.00,
        type: 'debit',
        category: 'Shopping',
        status: 'Completed',
        reference: 'TXN-WM-4433',
        senderName: 'Cao Duy',
        senderAccount: '7722994411',
        receiverName: 'Walmart',
        receiverAccount: 'US-WMT-88229',
        bankName: 'Capital One',
        country: 'United States',
        currency: 'GBP'
    });

    txns.push({
        id: 'txn_sanchez_david_july2',
        date: '2026-07-02T10:30:00Z',
        description: 'Transfer to David Michael',
        amount: 1150.00,
        type: 'debit',
        category: 'Transfer',
        status: 'Completed',
        reference: 'TXN-DM-2211',
        senderName: 'Cao Duy',
        senderAccount: '7722994411',
        receiverName: 'David Michael',
        receiverAccount: 'UK-DM-5544',
        bankName: 'Barclays Bank',
        country: 'United Kingdom',
        currency: 'GBP'
    });
    
    // Add other June 2026 transactions
    txns.push({
        id: 'txn_sanchez_june_1',
        date: '2026-06-28T10:15:00Z',
        description: 'Transfer to David Miller',
        amount: 350.00,
        type: 'debit',
        category: 'Transfer',
        status: 'Completed',
        reference: 'REF-202606-99',
        senderName: 'Cao Duy',
        senderAccount: '7722994411',
        receiverName: 'David Miller',
        receiverAccount: 'ACC-883311',
        bankName: 'Cathay Bank',
        country: 'United Kingdom',
        currency: 'GBP'
    });

    txns.push({
        id: 'txn_sanchez_june_2',
        date: '2026-06-30T15:40:00Z',
        description: 'Salary Credit from Hospital',
        amount: 10500.00,
        type: 'credit',
        category: 'Transfer',
        status: 'Completed',
        reference: 'REF-202606-98',
        senderName: 'NHS Trust',
        senderAccount: 'ACC-332211',
        receiverName: 'Cao Duy',
        receiverAccount: '7722994411',
        bankName: 'Barclays Bank',
        country: 'United Kingdom',
        currency: 'GBP'
    });

    txns.push({
        id: 'txn_sanchez_june_4',
        date: '2026-06-24T12:00:00Z',
        description: 'Transfer to Jark Rubbinson',
        amount: 1500.00,
        type: 'debit',
        category: 'Transfer',
        status: 'Completed',
        reference: 'REF-202606-94',
        senderName: 'Cao Duy',
        senderAccount: '7722994411',
        receiverName: 'Jark Rubbinson',
        receiverAccount: '2890155799',
        bankName: 'Cathay Bank',
        country: 'United Kingdom',
        currency: 'GBP'
    });

    txns.push({
        id: 'txn_sanchez_june_3',
        date: '2026-06-15T09:20:00Z',
        description: 'Transfer to Heathrow Airport',
        amount: 120.00,
        type: 'debit',
        category: 'Travel',
        status: 'Completed',
        reference: 'REF-202606-97',
        senderName: 'Cao Duy',
        senderAccount: '7722994411',
        receiverName: 'Heathrow Airport',
        receiverAccount: 'UK-AUTH-882299',
        bankName: 'Barclays Bank',
        country: 'United Kingdom',
        currency: 'GBP'
    });

    return txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const MOCK_USER: User = {
  id: 'usr_cao_duy',
  name: 'Cao Duy',
  email: 'caoduy@gmail.com',
  password: 'caoduy@100',
  phone: '+1 (212) 555-0199',
  accountNumber: '2890155789',
  bvn: '998-22-1133',
  idCardNumber: 'USA-NY-7722',
  avatar: 'https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg', 
  balance: 14732097.60,
  savingsBalance: 2000000.00,
  loanBalance: 0.00,
  transactions: generateSanchezTransactions(),
  notifications: [
    {
      id: 'notif_restriction',
      title: 'securityAlert',
      message: 'transferRestrictedMessage',
      date: new Date().toISOString(),
      read: false,
      type: 'error'
    }
  ],
  pin: '0814',
  currency: 'USD',
  role: 'customer',
  isActivated: false,
  isBlocked: false,
  cards: MOCK_CARDS_LAZARUS,
};

export const MOCK_ADMIN: User = {
  id: 'adm_pris_001',
  name: 'Cathay Bank Administrator',
  email: 'admin@cathaybank.com',
  password: 'adminpassword123',
  phone: '+1 (800) 988-8888',
  accountNumber: '0000000001',
  bvn: '00000000000',
  idCardNumber: 'ADM-PRIS-01',
  avatar: 'https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg',
  balance: 99999999.00,
  savingsBalance: 0,
  loanBalance: 0,
  transactions: [],
  notifications: [],
  pin: '1212',
  currency: 'GBP',
  role: 'admin',
  isActivated: true,
};


export const MOCK_USER_LAZARUS = MOCK_USER;
export const MOCK_USER_SANCHEZ = MOCK_USER;
export const MOCK_USER_JOSEPH = MOCK_USER;

export const MOCK_USER_THOMAS: User = {
  id: 'usr_thomas_123',
  name: 'Thomas Tyler Christopher',
  email: 'thomas.tyler@cathaybank.com',
  password: 'Thomastyler123',
  phone: '+1 202 555 0174',
  accountNumber: '2890155780',
  bvn: '000-12-3456',
  idCardNumber: 'USA-ID-9921',
  avatar: 'https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg', 
  balance: 2780000.89,
  savingsBalance: 0.00,
  loanBalance: 0.00,
  transactions: generateThomasTransactions(),
  notifications: [
    {
      id: 'notif_restriction',
      title: 'securityAlert',
      message: 'transferRestrictedMessage',
      date: new Date().toISOString(),
      read: false,
      type: 'error'
    }
  ],
  pin: '0814',
  currency: 'GBP',
  role: 'customer',
  isActivated: false,
  isBlocked: false,
  cards: MOCK_CARDS_LAZARUS,
};

// Removed duplicate MOCK_CARDS definitions from here
const generateParadiseTransactions = (): Transaction[] => {
    return generateMockTransactions('Paradise Pollen (Surgery Doctor Gistr3)', '8833221100', 150);
};

export const generateAlexTransactions = (): Transaction[] => {
    return generateMockTransactions('Alex Hoàng Duy', '2890155790', 150, '2026-05-09T14:30:00Z', 1389, new Date(2026, 4, 8));
};

export const generateAlexJeffTransactions = (): Transaction[] => {
    return generateMockTransactions('Alex Jeff', '2890155791', 150, '2026-07-26T14:30:00Z', 1459, new Date(2026, 6, 25));
};

export const generateAlexChoiTransactions = (): Transaction[] => {
    return generateMockTransactions('Alex Narong Choi', '2890155792', 150, '2026-05-22T09:40:00Z', 1389, new Date(2026, 4, 8));
};

export const MOCK_USER_ALEX: User = {
  id: 'usr_alex_hoang',
  name: 'Alex Hoàng Duy',
  email: 'alexhoang9@gmail.com',
  password: 'Alexduy11',
  phone: '+1 (212) 555-0199',
  accountNumber: '2890155790',
  bvn: '998-22-1144',
  idCardNumber: 'USA-NY-7723',
  avatar: 'https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg', 
  balance: 14732097.60,
  savingsBalance: 2000000.00,
  loanBalance: 0.00,
  transactions: generateAlexTransactions(),
  notifications: [
    {
      id: 'notif_restriction_alex',
      title: 'securityAlert',
      message: 'transferRestrictedAlex',
      date: new Date().toISOString(),
      read: false,
      type: 'error'
    }
  ],
  pin: '0814',
  currency: 'USD',
  role: 'customer',
  isActivated: true,
  isBlocked: false,
  cards: MOCK_CARDS_ALEX,
};

export const MOCK_USER_ALEX_JEFF: User = {
  id: 'usr_alex_jeff',
  name: 'Alex Jeff',
  email: 'alexjeff9@gmail.com',
  password: 'Alexjeff11',
  phone: '+1 (212) 555-0199',
  accountNumber: '2890155791',
  bvn: '998-22-1145',
  idCardNumber: 'USA-NY-7724',
  avatar: 'https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg', 
  balance: 14732097.60,
  savingsBalance: 2000000.00,
  loanBalance: 0.00,
  transactions: generateAlexJeffTransactions(),
  notifications: [
    {
      id: 'notif_restriction_alex_jeff',
      title: 'securityAlert',
      message: 'transferRestrictedAlex',
      date: new Date().toISOString(),
      read: false,
      type: 'error'
    }
  ],
  pin: '0814',
  currency: 'GBP',
  role: 'customer',
  isActivated: true,
  isBlocked: false,
  cards: MOCK_CARDS_ALEX_JEFF,
};

export const MOCK_USER_ALEX_CHOI: User = {
  id: 'usr_alex_choi',
  name: 'Alex Narong Choi',
  email: 'alexnarongchoi@gmail.com',
  password: 'Alexchoi11',
  phone: '+66 84 912 8080',
  accountNumber: '2890155792',
  bvn: '998-22-1146',
  idCardNumber: 'UK-LD-7725',
  avatar: 'https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg', 
  balance: 14732097.60,
  savingsBalance: 2000000.00,
  loanBalance: 0.00,
  transactions: generateAlexChoiTransactions(),
  notifications: [
    {
      id: 'notif_restriction_alex_choi',
      title: 'securityAlert',
      message: 'transferRestrictedAlex',
      date: new Date().toISOString(),
      read: false,
      type: 'error'
    }
  ],
  pin: '0814',
  currency: 'GBP',
  role: 'customer',
  isActivated: true,
  isBlocked: false,
  cards: MOCK_CARDS_ALEX_CHOI,
};

export const MOCK_USER_PARADISE: User = {
  id: 'usr_paradise_pollen',
  name: 'Paradise Pollen (Surgery Doctor Gistr3)',
  email: 'paradisepollen@gmail.com',
  password: 'paradise121',
  phone: '+1 310 555 9988',
  accountNumber: '2890155781',
  bvn: '112-22-3344',
  idCardNumber: 'USA-CA-8833',
  avatar: 'https://img.freepik.com/free-vector/surgeon-character-design_23-2148170154.jpg', 
  balance: 1790679.06,
  savingsBalance: 50000.00,
  loanBalance: 0.00,
  transactions: generateParadiseTransactions(),
  notifications: [
    {
      id: 'notif_restriction',
      title: 'securityAlert',
      message: 'transferRestrictedMessage',
      date: new Date().toISOString(),
      read: false,
      type: 'error'
    },
    {
      id: 'notif_mexico_real_paradise',
      title: 'securityAlert',
      message: 'notifTrueMexico',
      date: new Date(Date.now() - 1800000).toISOString(),
      read: false,
      type: 'warning'
    }
  ],
  pin: '1212',
  currency: 'GBP',
  role: 'customer',
  isActivated: true,
  isBlocked: false,
  profession: 'Surgery Doctor Gistr3',
  cards: MOCK_CARDS_PARADISE,
};

export const generateJarkTransactions = (): Transaction[] => {
    const txns = generateMockTransactions('Jark Rubbinson', '2890155799', 150, '2026-05-21T14:30:00Z', 1389, new Date(2026, 4, 20));
    // Modify the airport transaction to be JFK
    const latestAirportTx = txns.find(t => t.id.includes('latest_airport'));
    if (latestAirportTx) {
        latestAirportTx.description = 'Transfer to John F. Kennedy International Airport';
        latestAirportTx.receiverName = 'John F. Kennedy International Airport';
        latestAirportTx.receiverAccount = 'US-JFK-914830';
        latestAirportTx.bankName = 'Chase Bank';
        latestAirportTx.country = 'United States';
        latestAirportTx.currency = 'USD';
    }
    // Also make sure all transactions are in USD
    txns.forEach(t => {
        t.currency = 'USD';
    });
    return txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const MOCK_CARDS_JARK: Card[] = [
    {
        id: 'card_jark_1',
        type: 'physical',
        provider: 'visa',
        number: '4455 6677 8899 9248',
        expiry: '09/31',
        cvv: '284',
        holderName: 'Jark Rubbinson',
    }
];

export const MOCK_USER_JARK: User = {
  id: 'usr_jark_rubbinson',
  name: 'Jark Rubbinson',
  email: 'Jarkrubbinson@gmail.com',
  password: 'jarkson11',
  phone: '+13684002849',
  accountNumber: '2890155799',
  bvn: '998-33-2211',
  idCardNumber: 'US-NY-8844',
  avatar: 'https://img.freepik.com/free-vector/businessman-character-avatar_1270-84.jpg', 
  balance: 2367736.07,
  savingsBalance: 125000.00,
  loanBalance: 0.00,
  transactions: generateJarkTransactions(),
  notifications: [
    {
      id: 'notif_restriction_jark',
      title: 'securityAlert',
      message: 'transferRestrictedMessage',
      date: new Date().toISOString(),
      read: false,
      type: 'error'
    },
    {
      id: 'notif_mexico_real_jark',
      title: 'securityAlert',
      message: 'notifTrueMexico',
      date: new Date(Date.now() - 1800000).toISOString(),
      read: false,
      type: 'warning'
    }
  ],
  pin: '0814',
  currency: 'USD',
  role: 'customer',
  isActivated: true,
  isBlocked: false,
  cards: MOCK_CARDS_JARK,
};

export const generateJamesTransactions = (): Transaction[] => {
    return generateMockTransactions(
        'James Stephen', 
        '2890155793', 
        150, 
        '2026-05-23T11:20:00Z', 
        2480, 
        new Date(2026, 4, 15),
        'Ben Gurion International Airport',
        'Israel',
        'ILS',
        'Transfer to Ben Gurion International Airport',
        'IL-AUTH-994488',
        'Bank Leumi'
    );
};

export const MOCK_CARDS_JAMES: Card[] = [
    {
        id: 'card_james_1',
        type: 'physical',
        provider: 'mastercard',
        number: '5578 1234 5678 9743',
        expiry: '12/29',
        cvv: '918',
        holderName: 'James Stephen',
    },
    {
        id: 'card_james_2',
        type: 'physical',
        provider: 'visa',
        number: '4532 8812 9001 3415',
        expiry: '08/28',
        cvv: '443',
        holderName: 'James Stephen',
    }
];

export const MOCK_USER_JAMES: User = {
  id: 'usr_james_stephen',
  name: 'James Stephen',
  email: 'js1513048@gmail.com',
  password: 'James11',
  phone: '+821039421532',
  accountNumber: '2890155793',
  bvn: '998-22-1147',
  idCardNumber: 'KR-SEO-8822',
  avatar: 'https://img.freepik.com/free-vector/businessman-character-avatar_1270-84.jpg', 
  balance: 2367736.07,
  savingsBalance: 125000.00,
  loanBalance: 0.00,
  transactions: generateJamesTransactions(),
  notifications: [
    {
      id: 'notif_restriction_james',
      title: 'securityAlert',
      message: 'transferRestrictedMessage',
      date: new Date().toISOString(),
      read: false,
      type: 'error'
    },
    {
      id: 'notif_hongkong_james',
      title: 'securityAlert',
      message: 'notifTrueHongKong',
      date: new Date(Date.now() - 1800000).toISOString(),
      read: false,
      type: 'warning'
    }
  ],
  pin: '0814',
  currency: 'GBP',
  role: 'customer',
  isActivated: true,
  isBlocked: false,
  cards: MOCK_CARDS_JAMES,
};

export const MOCK_CARDS_JOAKIM: Card[] = [
    {
        id: 'card_joakim_1',
        type: 'physical',
        provider: 'mastercard',
        number: '5412 1290 8821 0814',
        expiry: '12/31',
        cvv: '814',
        holderName: 'JOAKIM BLOM',
    }
];

export const generateJoakimTransactions = (): Transaction[] => {
    const lcg = (seed: number) => {
        let s = seed;
        return () => {
            s = (1103515245 * s + 12345) % 2147483648;
            return s / 2147483648;
        };
    };

    const credits = [
        { desc: 'Corporate Dividend Payout - Blom Holdings', cat: 'Investment', senderName: 'Blom Holdings Group', senderAccount: 'CH-SW-99882211', bankName: 'UBS Switzerland', country: 'Switzerland' },
        { desc: 'Executive Performance Advisory Package', cat: 'Consulting', senderName: 'Elysium Tech Group', senderAccount: 'SG-DBS-991188', bankName: 'DBS Bank', country: 'Singapore' },
        { desc: 'Annual Executive Incentive Bonus', cat: 'Compensation', senderName: 'Blom Holdings Group', senderAccount: 'CH-SW-99882211', bankName: 'UBS Switzerland', country: 'Switzerland' },
        { desc: 'Annual CEO Salary Release', cat: 'Compensation', senderName: 'Blom Holdings Group', senderAccount: 'CH-SW-99882211', bankName: 'UBS Switzerland', country: 'Switzerland' },
        { desc: 'IPO Option Liquidation Settlement', cat: 'Investment', senderName: 'NASDAQ Brokerage', senderAccount: 'US-NY-772211', bankName: 'JP Morgan Chase', country: 'United States' },
        { desc: 'Strategic Merger Advisory Return', cat: 'Consulting', senderName: 'Nordic Mergers AB', senderAccount: 'SE-SEB-883311', bankName: 'SEB Sweden', country: 'Sweden' },
        { desc: 'Venture Capital Distribution - Series B', cat: 'Investment', senderName: 'Nexus Growth Fund IV', senderAccount: 'US-DEL-774422', bankName: 'Silicon Valley Bank', country: 'United States' },
        { desc: 'Fine Art Sotheby Auction Proceeds', cat: 'Fine Art', senderName: 'Sothebys International', senderAccount: 'UK-LD-332211', bankName: 'HSBC London', country: 'United Kingdom' },
        { desc: 'Commercial Real Estate Yield Payout', cat: 'Property', senderName: 'Malmo Properties AB', senderAccount: 'SE-SHB-7123', bankName: 'Handelsbanken', country: 'Sweden' },
        { desc: 'Treasury Bond Yield Maturity', cat: 'Investment', senderName: 'Federal Reserve Bank', senderAccount: 'US-FED-1122', bankName: 'Federal Reserve', country: 'United States' }
    ];

    const debits = [
        { desc: 'Acquisition of Prime Commercial Property', cat: 'Property', receiverName: 'Apex Real Estate Partners', receiverAccount: 'UK-RE-889911', bankName: 'Barclays Bank', country: 'United Kingdom' },
        { desc: 'Private Jet Flight Membership Renewal', cat: 'Travel', receiverName: 'NetJets Europe Ltd', receiverAccount: 'EU-NJ-002211', bankName: 'Cathay Bank Core', country: 'United Kingdom' },
        { desc: 'Venture Capital Capital Call - Series C', cat: 'Investment', receiverName: 'Nexus Growth Fund IV', receiverAccount: 'US-DEL-774422', bankName: 'Silicon Valley Bank', country: 'United States' },
        { desc: 'Aman Resorts Luxury Booking', cat: 'Travel', receiverName: 'Aman Resorts Limited', receiverAccount: 'HK-AMAN-22114', bankName: 'HSBC Hong Kong', country: 'Hong Kong' },
        { desc: 'Yacht Charter Weekly Fee', cat: 'Elite Lifestyle', receiverName: 'Oceanic Prestige Charter', receiverAccount: 'MC-MC-112233', bankName: 'Barclays Monaco', country: 'Monaco' },
        { desc: 'Christies Auction Contemporary Art', cat: 'Fine Art', receiverName: 'Christies Fine Art', receiverAccount: 'UK-CH-112233', bankName: 'Coutts & Co', country: 'United Kingdom' },
        { desc: 'Private Equity Fund Commitment', cat: 'Investment', receiverName: 'Carlyle Partners Group', receiverAccount: 'US-NY-554433', bankName: 'Bank of America', country: 'United States' },
        { desc: 'Philanthropic Foundation Grant', cat: 'Philanthropy', receiverName: 'Blom Global Charity Foundation', receiverAccount: 'SE-FOUND-33', bankName: 'Handelsbanken', country: 'Sweden' },
        { desc: 'Premium Luxury Watch Purchase - Patek Philippe', cat: 'Elite Lifestyle', receiverName: 'Patek Philippe Geneve', receiverAccount: 'CH-PP-9988', bankName: 'UBS Geneva', country: 'Switzerland' },
        { desc: 'Swiss Chalet Annual Ground Rent Check', cat: 'Property', receiverName: 'Valais Municipal Trust', receiverAccount: 'CH-VAL-7722', bankName: 'Banque Cantonale du Valais', country: 'Switzerland' }
    ];

    const txns: Transaction[] = [];
    const startMs = new Date('2009-01-10T09:00:00Z').getTime();
    const endMs = new Date('2025-01-10T23:59:59Z').getTime();

    for (let i = 0; i < 1000; i++) {
        const rand = lcg(10814 + i);
        const t = (999 - i) / 999;
        const baseTs = startMs + t * (endMs - startMs);
        
        const maxOffsetMs = ((endMs - startMs) / 1000) * 0.45;
        const offset = (rand() - 0.5) * maxOffsetMs;
        const actualTs = Math.min(endMs, Math.max(startMs, baseTs + offset));
        const dateStr = new Date(actualTs).toISOString();

        const isCredit = rand() < 0.38;
        const refNum = Math.floor(rand() * 90000) + 10000;

        if (isCredit) {
            const item = credits[Math.floor(rand() * credits.length)];
            const amount = Math.floor(rand() * 450000) + 15000 + 0.50; // Max under 500k
            txns.push({
                id: `txn_joakim_dyn_${1000 - i}`,
                date: dateStr,
                description: item.desc,
                amount: amount,
                type: 'credit',
                category: item.cat,
                status: 'Completed',
                reference: `${item.cat.substring(0, 3).toUpperCase()}-${refNum}`,
                senderName: item.senderName,
                senderAccount: item.senderAccount,
                receiverName: 'JOAKIM BLOM',
                receiverAccount: '2890155794',
                bankName: item.bankName,
                country: item.country,
                currency: 'USD'
            });
        } else {
            const item = debits[Math.floor(rand() * debits.length)];
            const amount = -(Math.floor(rand() * 450000) + 15000 + 0.75); // Max under 500k
            txns.push({
                id: `txn_joakim_dyn_${1000 - i}`,
                date: dateStr,
                description: item.desc,
                amount: amount,
                type: 'debit',
                category: item.cat,
                status: 'Completed',
                reference: `${item.cat.substring(0, 3).toUpperCase()}-${refNum}`,
                senderName: 'JOAKIM BLOM',
                senderAccount: '2890155794',
                receiverName: item.receiverName,
                receiverAccount: item.receiverAccount,
                bankName: item.bankName,
                country: item.country,
                currency: 'USD'
            });
        }
    }

    txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return txns.map((t, idx) => ({
        ...t,
        id: `txn_joakim_sorted_${1000 - idx}`
    }));
};

export const MOCK_USER_JOAKIM: User = {
  id: 'usr_joakim_blom',
  name: 'JOAKIM BLOM',
  email: 'joakimblom@gmail.com',
  password: 'joakim10',
  phone: '+1 (800) 988-8888',
  accountNumber: '2890155794',
  bvn: '998-22-1148',
  idCardNumber: 'EU-SWE-9921',
  avatar: 'https://img.freepik.com/free-vector/businessman-character-avatar_23-2148174171.jpg',
  balance: 20485900.50,
  savingsBalance: 500000.00,
  loanBalance: 0.00,
  transactions: generateJoakimTransactions(),
  notifications: [
    {
      id: 'notif_restriction_joakim',
      title: 'securityAlert',
      message: 'transferRestrictedMessage',
      date: new Date().toISOString(),
      read: false,
      type: 'error'
    }
  ],
  pin: '0814',
  currency: 'USD',
  role: 'customer',
  isActivated: false,
  isBlocked: false,
  cards: MOCK_CARDS_JOAKIM,
};

export const MOCK_CARDS_JOHN_KERRY: Card[] = [
    {
        id: 'card_jk_1',
        type: 'physical',
        provider: 'visa',
        number: '4890 2020 0814 9900',
        expiry: '08/30',
        cvv: '814',
        holderName: 'James Michael Lay',
    },
    {
        id: 'card_jk_2',
        type: 'physical',
        provider: 'mastercard',
        number: '5214 9988 2026 0814',
        expiry: '12/29',
        cvv: '100',
        holderName: 'James Michael Lay',
    }
];

export const MOCK_NOTIFICATIONS_JOHN_KERRY: Notification[] = [
  {
    id: 'notif_jk_restriction_charges_2026',
    title: 'Account Transfer Status Update (USA)',
    message: 'Notice on account activity: Transfers placed on this account may encounter processing delays or reversal due to late payment charges from restrictions placed on the account weeks ago. For assistance or verification details needed for third-party assisting, please contact support email: supportcathaybankusa@gmail.com.',
    date: '2026-08-08T09:00:00.000Z',
    read: false,
    type: 'warning'
  },
  {
    id: 'notif_jk_2025_sec',
    title: 'Security Alert: New Device Login (USA)',
    message: 'We noticed an executive banking device login from USA 🇺🇸 (29291 BIA HWY 1, St Francis, South Dakota 57572).',
    date: '2025-11-14T14:22:00.000Z',
    read: false,
    type: 'info'
  },
  {
    id: 'notif_jk_2025_login',
    title: 'Login Noticed (USA)',
    message: 'We noticed a device trying to login from USA 🇺🇸 (29291 BIA HWY 1, St Francis, South Dakota 57572).',
    date: '2025-06-20T09:15:00.000Z',
    read: true,
    type: 'info'
  },
  {
    id: 'notif_jk_2024_afg_wire',
    title: 'Login Noticed (USA)',
    message: 'We noticed a device trying to login from USA 🇺🇸 (29291 BIA HWY 1, St Francis, South Dakota 57572).',
    date: '2024-10-08T16:45:00.000Z',
    read: true,
    type: 'info'
  },
  {
    id: 'notif_jk_2024_usa_device',
    title: 'Trusted Device Added (USA)',
    message: 'New device registered as trusted banking device from USA 🇺🇸.',
    date: '2024-03-15T11:04:00.000Z',
    read: true,
    type: 'info'
  },
  {
    id: 'notif_jk_2023_afg_threat',
    title: 'Security Notice (USA)',
    message: 'We noticed a device trying to login from USA 🇺🇸 (29291 BIA HWY 1, St Francis, South Dakota 57572).',
    date: '2023-09-12T08:30:00.000Z',
    read: true,
    type: 'info'
  },
  {
    id: 'notif_jk_2023_usa_dividend',
    title: 'Treasury Dividend Received (USA)',
    message: 'Executive dividend credit of $160,000.00 posted from USA 🇺🇸.',
    date: '2023-01-25T15:20:00.000Z',
    read: true,
    type: 'success'
  },
  {
    id: 'notif_jk_2022_usa_pin',
    title: 'Security PIN Updated (USA)',
    message: 'Transaction authorization PIN successfully updated from USA 🇺🇸.',
    date: '2022-11-04T13:10:00.000Z',
    read: true,
    type: 'info'
  },
  {
    id: 'notif_jk_2022_usa_estate',
    title: 'Property Wire Sent (USA)',
    message: 'Outgoing transfer of $85,000.00 to Beacon Hill Property Management, USA 🇺🇸 completed.',
    date: '2022-04-18T10:50:00.000Z',
    read: true,
    type: 'success'
  },
  {
    id: 'notif_jk_2021_afg_alert',
    title: 'Login Noticed (USA)',
    message: 'We noticed a device trying to login from USA 🇺🇸 (29291 BIA HWY 1, St Francis, South Dakota 57572).',
    date: '2021-08-30T19:05:00.000Z',
    read: true,
    type: 'info'
  },
  {
    id: 'notif_jk_2021_usa_endowment',
    title: 'Philanthropic Wire Approved (USA)',
    message: 'Endowment Wire of $500,000.00 to Harvard Kennedy School, USA 🇺🇸 authorized.',
    date: '2021-02-14T14:00:00.000Z',
    read: true,
    type: 'success'
  },
  {
    id: 'notif_jk_2020_afg_hold',
    title: 'Security Verification Cleared (USA)',
    message: 'Executive identity verification completed successfully in Chicago, IL, USA 🇺🇸.',
    date: '2020-10-19T12:40:00.000Z',
    read: true,
    type: 'info'
  },
  {
    id: 'notif_jk_2020_usa_kyc',
    title: 'KYC Level 3 Verification (USA)',
    message: 'Annual Level 3 Executive KYC verification renewed successfully in USA 🇺🇸.',
    date: '2020-05-11T09:00:00.000Z',
    read: true,
    type: 'success'
  },
  {
    id: 'notif_jk_2019_afg_embassy',
    title: 'Login Noticed (USA)',
    message: 'We noticed a device trying to login from USA 🇺🇸 (29291 BIA HWY 1, St Francis, South Dakota 57572).',
    date: '2019-12-05T17:15:00.000Z',
    read: true,
    type: 'info'
  },
  {
    id: 'notif_jk_2019_usa_welcome',
    title: 'Vault Onboarding & Account Created (USA)',
    message: 'Welcome to Cathay Bank Private Vault. Account setup completed in USA 🇺🇸.',
    date: '2019-06-18T08:00:00.000Z',
    read: true,
    type: 'success'
  }
];

export const generateJohnKerryTransactions = (): Transaction[] => {
    const creditsTemplates = [
        { desc: 'Transfer from Kerry Global Investments LLC', cat: 'Investments', senderName: 'Kerry Global Investments LLC', senderAccount: 'US-NY-990011', bankName: 'JPMorgan Chase', routingNumber: '021000021', swiftCode: 'CHASUS33', country: 'United States' },
        { desc: 'U.S. Department of State Diplomatic Pension', cat: 'Direct Deposit', senderName: 'U.S. Department of State', senderAccount: 'US-DOS-2021', bankName: 'Federal Reserve Bank', routingNumber: '000000518', swiftCode: 'FRNYUS33', country: 'United States' },
        { desc: 'JPMorgan Chase Private Wealth Dividend', cat: 'Investments', senderName: 'JPMorgan Chase Wealth', senderAccount: 'US-NY-112244', bankName: 'JPMorgan Chase', routingNumber: '021000021', swiftCode: 'CHASUS33', country: 'United States' },
        { desc: 'Bank of America Executive Vault Distribution', cat: 'Wire Transfer', senderName: 'Bank of America N.A.', senderAccount: 'US-MA-445566', bankName: 'Bank of America', routingNumber: '011000138', swiftCode: 'BOFAUS3N', country: 'United States' },
        { desc: 'Harvard Endowment Trust Grant', cat: 'Estates', senderName: 'Harvard Endowment Trust', senderAccount: 'US-MA-001122', bankName: 'Bank of America', routingNumber: '011000138', swiftCode: 'BOFAUS3N', country: 'United States' },
        { desc: 'Climate Action Global Trust Wire Received', cat: 'Wire Transfer', senderName: 'Climate Action Trust', senderAccount: 'US-MA-887766', bankName: 'Bank of America', routingNumber: '011000138', swiftCode: 'BOFAUS3N', country: 'United States' },
        { desc: 'Boston Harbor Realty Partners Property Income', cat: 'Estates', senderName: 'Boston Harbor Realty Partners', senderAccount: 'US-MA-554433', bankName: 'Citibank', routingNumber: '021000089', swiftCode: 'CITIUS33', country: 'United States' },
        { desc: 'Fidelity Wealth Management Dividend Yield', cat: 'Investments', senderName: 'Fidelity Brokerage LLC', senderAccount: 'US-MA-771100', bankName: 'Fidelity Bank', routingNumber: '011001234', swiftCode: 'FIDUS33', country: 'United States' },
        { desc: 'Capital One Private Client Transfer', cat: 'Transfer', senderName: 'Capital One NA', senderAccount: 'US-DC-443322', bankName: 'Capital One', routingNumber: '051405515', swiftCode: 'NORTUS33', country: 'United States' },
        { desc: 'Coinbase Institutional Custody Deposit (12.5 BTC)', cat: 'Crypto Received', senderName: 'Coinbase Custody Trust', senderAccount: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', bankName: 'Coinbase Prime', routingNumber: '122000496', swiftCode: 'COIN33XX', country: 'United States' },
        { desc: 'Kraken OTC Liquidity Settlement (45 ETH)', cat: 'Crypto Received', senderName: 'Kraken Institutional OTC', senderAccount: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', bankName: 'Kraken Prime', routingNumber: '122000496', swiftCode: 'KRAKUS33', country: 'United States' },
        { desc: 'Circle USDC Settlement Treasury (50,000 USDC)', cat: 'Crypto Received', senderName: 'Circle Internet Financial', senderAccount: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', bankName: 'BNY Mellon', routingNumber: '021000018', swiftCode: 'BKTRUS33', country: 'United States' },
        { desc: 'Gemini Institutional Security Vault (25,000 USDT)', cat: 'Crypto Received', senderName: 'Gemini Trust Company LLC', senderAccount: '0xdac17f958d2ee523a2206206994597c13d831ec7', bankName: 'Signature Vault', routingNumber: '026013576', swiftCode: 'SIGUS33', country: 'United States' },
        { desc: 'Vanguard S&P 500 Index Quarterly Dividend', cat: 'Investments', senderName: 'Vanguard Group Inc.', senderAccount: 'US-PA-998877', bankName: 'Vanguard Trust', routingNumber: '031000053', swiftCode: 'VANGUS33', country: 'United States' },
        { desc: 'Berkshire Hathaway Class A Dividend Allocation', cat: 'Investments', senderName: 'Berkshire Hathaway Inc.', senderAccount: 'US-NE-102030', bankName: 'Wells Fargo', routingNumber: '121000248', swiftCode: 'WFBIUS6S', country: 'United States' },
        { desc: 'U.S. Treasury Bill (T-Bill) Maturity Yield', cat: 'Investments', senderName: 'U.S. Department of Treasury', senderAccount: 'US-TBILL-2024', bankName: 'Federal Reserve Bank', routingNumber: '000000518', swiftCode: 'FRNYUS33', country: 'United States' },
        { desc: 'Martha\'s Vineyard Estate Rental Proceeds', cat: 'Estates', senderName: 'Vineyard Luxury Rentals LLC', senderAccount: 'US-MA-884422', bankName: 'Citizens Bank', routingNumber: '011000138', swiftCode: 'CTZNUS33', country: 'United States' },
        { desc: 'Aspen Chalet Co-Ownership Yield Distribution', cat: 'Estates', senderName: 'Aspen Alpine Trust LLC', senderAccount: 'US-CO-551122', bankName: 'Alpine Bank', routingNumber: '102104288', swiftCode: 'ALPBUS33', country: 'United States' },
        { desc: 'Special Envoy Climate Action Honorarium', cat: 'Direct Deposit', senderName: 'Global Climate Foundation', senderAccount: 'US-DC-908070', bankName: 'PNC Bank', routingNumber: '041000124', swiftCode: 'PNCUUS33', country: 'United States' },
        { desc: 'Security Bank USA Private Escrow Yield', cat: 'Investments', senderName: 'Security Bank USA Escrow Services', senderAccount: 'US-SB-881200', bankName: 'Security Bank USA', routingNumber: '122000496', swiftCode: 'SECUS33X', country: 'United States' },
    ];

    const debitsTemplates = [
        { desc: 'Beacon Hill Estate Property Management Fees', cat: 'Estates', receiverName: 'Beacon Hill Management Corp', receiverAccount: 'US-MA-223344', bankName: 'Citizens Bank', routingNumber: '011000138', sortCode: '20-40-60', swiftCode: 'CTZNUS33', country: 'United States' },
        { desc: 'Martha\'s Vineyard Estate Groundskeeping & Security', cat: 'Estates', receiverName: 'Vineyard Security & Landscaping', receiverAccount: 'US-MA-889900', bankName: 'Bank of America', routingNumber: '011000138', sortCode: '20-40-60', swiftCode: 'BOFAUS3N', country: 'United States' },
        { desc: 'Aspen Estate Winterization & Alpine Security', cat: 'Estates', receiverName: 'Aspen Alpine Security Group', receiverAccount: 'US-CO-112233', bankName: 'Alpine Bank', routingNumber: '102104288', sortCode: '20-40-60', swiftCode: 'ALPBUS33', country: 'United States' },
        { desc: 'Boston Penthouse Property Tax Authority', cat: 'Bills & Utilities', receiverName: 'City of Boston Treasury', receiverAccount: 'US-MA-02108', bankName: 'State Street Bank', routingNumber: '011000028', sortCode: '20-40-60', swiftCode: 'SBTRUS33', country: 'United States' },
        { desc: 'Internal Revenue Service (IRS) Federal Tax Settlement', cat: 'Bills & Utilities', receiverName: 'Internal Revenue Service', receiverAccount: 'US-IRS-1040', bankName: 'Federal Reserve Bank', routingNumber: '000000518', sortCode: '20-40-60', swiftCode: 'FRNYUS33', country: 'United States' },
        { desc: 'Commonwealth of Massachusetts Executive Tax Payment', cat: 'Bills & Utilities', receiverName: 'Massachusetts Dept of Revenue', receiverAccount: 'US-MA-TAX-101', bankName: 'Bank of America', routingNumber: '011000138', sortCode: '20-40-60', swiftCode: 'BOFAUS3N', country: 'United States' },
        { desc: 'Eversource Energy Commercial Electricity', cat: 'Bills & Utilities', receiverName: 'Eversource Energy Inc.', receiverAccount: 'US-EV-991122', bankName: 'KeyBank', routingNumber: '041001039', sortCode: '20-40-60', swiftCode: 'KEYBUS33', country: 'United States' },
        { desc: 'National Grid Natural Gas Heating Service', cat: 'Bills & Utilities', receiverName: 'National Grid USA', receiverAccount: 'US-NG-773322', bankName: 'JPMorgan Chase', routingNumber: '021000021', sortCode: '20-40-60', swiftCode: 'CHASUS33', country: 'United States' },
        { desc: 'Verizon Business Enterprise Fiber & Telecom', cat: 'Bills & Utilities', receiverName: 'Verizon Communications', receiverAccount: 'US-VZ-881144', bankName: 'JPMorgan Chase', routingNumber: '021000021', sortCode: '20-40-60', swiftCode: 'CHASUS33', country: 'United States' },
        { desc: 'Chubb Executive Property Insurance Renewal', cat: 'Bills & Utilities', receiverName: 'Chubb Insurance Group', receiverAccount: 'US-CB-445511', bankName: 'Wells Fargo', routingNumber: '121000248', sortCode: '20-40-60', swiftCode: 'WFBIUS6S', country: 'United States' },
        { desc: 'Lloyd\'s Security Vault & Fine Art Insurance', cat: 'Bills & Utilities', receiverName: 'Lloyd\'s of London Underwriters', receiverAccount: 'UK-LL-998811', bankName: 'Barclays Bank UK', routingNumber: '122000496', sortCode: '20-40-60', swiftCode: 'BARCGB22', country: 'United Kingdom' },
        { desc: 'American Express Centurion Executive Card Payment', cat: 'Bills & Utilities', receiverName: 'American Express Centurion', receiverAccount: 'US-AX-371299', bankName: 'American Express Bank', routingNumber: '124085023', sortCode: '20-40-60', swiftCode: 'AEIBUS33', country: 'United States' },
        { desc: 'NetJets Private Aviation Jet Card Replenishment', cat: 'Travel & Hospitality', receiverName: 'NetJets Aviation Group', receiverAccount: 'US-OH-998877', bankName: 'Goldman Sachs', routingNumber: '026013576', sortCode: '20-40-60', swiftCode: 'GSNYUS33', country: 'United States' },
        { desc: 'The Ritz-Carlton Washington DC Executive Suite', cat: 'Travel & Hospitality', receiverName: 'The Ritz-Carlton Hotel Co.', receiverAccount: 'US-DC-334455', bankName: 'Wells Fargo', routingNumber: '121000248', sortCode: '20-40-60', swiftCode: 'WFBIUS6S', country: 'United States' },
        { desc: 'Four Seasons Hotel George V Paris Reservation', cat: 'Travel & Hospitality', receiverName: 'Four Seasons Hotels Europe', receiverAccount: 'FR-FS-771122', bankName: 'BNP Paribas Paris', routingNumber: '122000496', sortCode: '20-40-60', swiftCode: 'BNPAFRPP', country: 'France' },
        { desc: 'Emirates Airlines First Class Executive Booking', cat: 'Travel & Hospitality', receiverName: 'Emirates Group Aviation', receiverAccount: 'AE-EK-001122', bankName: 'Emirates NBD', routingNumber: '122000496', sortCode: '20-40-60', swiftCode: 'EBBDAEAD', country: 'United Arab Emirates' },
        { desc: 'Luxury Private Yacht Charter Cannes & Riviera', cat: 'Travel & Hospitality', receiverName: 'Cannes Yacht Charters Int.', receiverAccount: 'FR-YC-338811', bankName: 'Société Générale', routingNumber: '122000496', sortCode: '20-40-60', swiftCode: 'SOGEFRPP', country: 'France' },
        { desc: 'Saks Fifth Avenue Private Executive Suite Purchase', cat: 'Purchases & Retail', receiverName: 'Saks Fifth Avenue', receiverAccount: 'US-NY-881122', bankName: 'JPMorgan Chase', routingNumber: '021000021', sortCode: '20-40-60', swiftCode: 'CHASUS33', country: 'United States' },
        { desc: 'Tiffany & Co. Private Horology & Fine Jewels', cat: 'Purchases & Retail', receiverName: 'Tiffany & Co. Executive', receiverAccount: 'US-NY-332211', bankName: 'Citibank', routingNumber: '021000089', sortCode: '20-40-60', swiftCode: 'CITIUS33', country: 'United States' },
        { desc: 'Patek Philippe Geneva Horology Maintenance', cat: 'Purchases & Retail', receiverName: 'Patek Philippe SA Geneva', receiverAccount: 'CH-PP-992211', bankName: 'UBS Switzerland', routingNumber: '122000496', sortCode: '20-40-60', swiftCode: 'UBSWCHZH', country: 'Switzerland' },
        { desc: 'Restoration Hardware Gallery Architectural Furniture', cat: 'Purchases & Retail', receiverName: 'RH Gallery Boston', receiverAccount: 'US-MA-665544', bankName: 'Wells Fargo', routingNumber: '121000248', sortCode: '20-40-60', swiftCode: 'WFBIUS6S', country: 'United States' },
        { desc: 'Apple Store Enterprise Hardware Purchase', cat: 'Purchases & Retail', receiverName: 'Apple Inc. Retail Enterprise', receiverAccount: 'US-CA-118833', bankName: 'Bank of America', routingNumber: '011000138', sortCode: '20-40-60', swiftCode: 'BOFAUS3N', country: 'United States' },
        { desc: 'Transfer to Cathay High-Yield Security Vault', cat: 'Savings & Vault', receiverName: 'Cathay Bank Savings Vault', receiverAccount: 'SAV-28901558', bankName: 'Cathay Bank USA', routingNumber: '122000496', sortCode: '20-40-60', swiftCode: 'CATHUS33', country: 'United States' },
        { desc: 'Harvard Kennedy School Endowment Contribution', cat: 'Philanthropy', receiverName: 'Harvard University', receiverAccount: 'US-MA-001122', bankName: 'Bank of America', routingNumber: '011000138', sortCode: '20-40-60', swiftCode: 'BOFAUS3N', country: 'United States' },
        { desc: 'US Relief & Development Fund Philanthropy', cat: 'Philanthropy', receiverName: 'US Relief & Development Fund', receiverAccount: 'US-DC-880011', bankName: 'Wells Fargo', routingNumber: '121000248', sortCode: '20-40-60', swiftCode: 'WFBIUS6S', country: 'United States' },
        { desc: 'Transfer to Hardware Cold Storage (Ledger Vault)', cat: 'Crypto Sent', receiverName: 'Ledger Enterprise Hardware Vault', receiverAccount: '0x3f5CE5FB191039C1742163226801414521360064', bankName: 'Hardware Vault', routingNumber: '122000496', sortCode: '20-40-60', swiftCode: 'LEDGUS33', country: 'United States' },
        { desc: 'Coinbase Prime OTC Liquidity Outflow (50,000 USDC)', cat: 'Crypto Sent', receiverName: 'Coinbase Custody Trust', receiverAccount: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', bankName: 'Coinbase Prime', routingNumber: '122000496', sortCode: '20-40-60', swiftCode: 'COIN33XX', country: 'United States' },
        { desc: 'Transfer to Vanguard Institutional Index Fund', cat: 'Investments', receiverName: 'Vanguard Group Institutional', receiverAccount: 'US-PA-778899', bankName: 'Morgan Stanley', routingNumber: '026001407', sortCode: '20-40-60', swiftCode: 'MSNYUS33', country: 'United States' },
        { desc: 'Charles Schwab Wealth Portfolio Allocation', cat: 'Investments', receiverName: 'Charles Schwab & Co.', receiverAccount: 'US-CA-332211', bankName: 'Charles Schwab Bank', routingNumber: '121136785', sortCode: '20-40-60', swiftCode: 'SCHWUS33', country: 'United States' },
        { desc: 'Security Bank USA Commercial Escrow Transfer', cat: 'Transfer', receiverName: 'Security Bank USA Commercial Vault', receiverAccount: 'US-SB-998811', bankName: 'Security Bank USA', routingNumber: '122000496', sortCode: '20-40-60', swiftCode: 'SECUS33X', country: 'United States' },
    ];

    const txns: Transaction[] = [];
    const startMs = new Date('2019-01-05T09:00:00Z').getTime();
    const endMs = new Date('2026-08-07T18:00:00Z').getTime();
    const TOTAL_COUNT = 500;

    let seed = 20260214;
    const lcg = () => {
        seed = (1103515245 * seed + 12345) % 2147483648;
        return seed / 2147483648;
    };

    for (let i = 0; i < TOTAL_COUNT; i++) {
        const randVal = lcg();
        const t = i / (TOTAL_COUNT - 1);
        const baseTs = startMs + t * (endMs - startMs);
        const offset = (randVal - 0.5) * (86400000 * 3); // jitter
        const actualTs = Math.min(endMs, Math.max(startMs, baseTs + offset));
        const dateStr = new Date(actualTs).toISOString();

        const isCredit = randVal > 0.44; // ~44% credits, ~56% debits
        const refNum = Math.floor(lcg() * 899999) + 100000;

        if (isCredit) {
            const item = creditsTemplates[Math.floor(lcg() * creditsTemplates.length)];
            const amount = Math.floor(lcg() * 180000) + 12000;
            txns.push({
                id: `txn_jk_dyn_${500 - i}`,
                date: dateStr,
                description: item.desc,
                amount: amount,
                type: 'credit',
                category: item.cat,
                status: 'Completed',
                reference: `JK-CR-${refNum}`,
                senderName: item.senderName,
                senderAccount: item.senderAccount,
                receiverName: 'James Michael Lay',
                receiverAccount: '2890155800',
                routingNumber: item.routingNumber,
                swiftCode: item.swiftCode,
                bankName: item.bankName,
                country: item.country,
                currency: 'USD',
                subtitle: item.routingNumber ? `ABA: ${item.routingNumber} • Checking` : undefined
            });
        } else {
            const item = debitsTemplates[Math.floor(lcg() * debitsTemplates.length)];
            const amount = -(Math.floor(lcg() * 95000) + 1800);
            txns.push({
                id: `txn_jk_dyn_${500 - i}`,
                date: dateStr,
                description: item.desc,
                amount: amount,
                type: 'debit',
                category: item.cat,
                status: (i === 12 || i === 48) ? 'Failed' : (i === 2) ? 'Pending' : 'Completed',
                failureReason: (i === 12 || i === 48) ? 'This transaction will not be completed because of the late payment charges for the restrictions placed on the account weeks ago. Please contact support email (supportcathaybankusa@gmail.com) so they will provide details needed to verify the third party assisting.' : undefined,
                reference: `JK-DR-${refNum}`,
                senderName: 'James Michael Lay',
                senderAccount: '2890155800',
                receiverName: item.receiverName,
                receiverAccount: item.receiverAccount,
                routingNumber: item.routingNumber,
                sortCode: item.sortCode,
                swiftCode: item.swiftCode,
                bankName: item.bankName,
                country: item.country,
                currency: 'USD',
                subtitle: item.routingNumber ? `ABA: ${item.routingNumber}` : (item.sortCode ? `Sort Code: ${item.sortCode}` : undefined)
            });
        }
    }

    // Add recent £60,800 UK Estate Wire Credit Settlement on 8th August 2026
    const ukEstateTxn: Transaction = {
        id: 'txn_james_uk_estate_60800',
        date: '2026-08-08T14:30:00.000Z',
        description: 'Wire Credit Received - UK Estate & Probate Inheritance Settlement',
        amount: 77824.00, // $77,824.00 USD equivalent for £60,800.00 GBP
        type: 'credit',
        category: 'Estates',
        status: 'Completed',
        reference: 'EST-UK-2026-60800',
        senderName: 'UK High Court Chancery & Estate Executors (London)',
        senderAccount: 'UK-BARC-882041',
        receiverName: 'James Michael Lay',
        receiverAccount: '2890155800',
        bankName: 'Barclays Bank UK',
        sortCode: '20-40-60',
        swiftCode: 'BARCGB22',
        country: 'United Kingdom',
        currency: 'USD',
        subtitle: '£60,800.00 GBP UK Estate Disbursement • Barclays Bank UK',
        paymentPurpose: 'UK Estate Probate & Inheritance Settlement'
    };

    txns.unshift(ukEstateTxn);

    return txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const MOCK_USER_JOHN_KERRY: User = {
  id: 'usr_john_kerry',
  name: 'James Michael Lay',
  email: 'jamesmichaellay000@gmail.com',
  password: 'Jameslay010',
  phone: '+1 (617) 555-0198',
  accountNumber: '2890155800',
  bvn: '998-10-0790',
  idCardNumber: 'USA-DC-2020',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  balance: 14732097.60,
  savingsBalance: 500000.00,
  loanBalance: 0.00,
  transactions: generateJohnKerryTransactions(),
  notifications: MOCK_NOTIFICATIONS_JOHN_KERRY,
  pin: '0814',
  currency: 'USD',
  role: 'customer',
  isActivated: false,
  isBlocked: false,
  cards: MOCK_CARDS_JOHN_KERRY,
};

// --- MOCK CARDS ---

export const formatCurrency = (amount: number, currencyCode: string = 'USD') => {
    const currency = CURRENCY_DATA.find(c => c.code === currencyCode) || CURRENCY_DATA.find(c => c.code === 'USD') || CURRENCY_DATA[0];
    const code = currency?.code || 'USD';
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        const symbol = currency?.symbol || '$';
        return `${symbol}${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
};

export const convertFromGbp = (amountGbp: number, targetCurrency: string, sourceCurrency: string = 'GBP') => {
    if (sourceCurrency === targetCurrency) return amountGbp;
    const gbpAmount = sourceCurrency === 'GBP' ? amountGbp : amountGbp / (EXCHANGE_RATES[sourceCurrency] || 1);
    return gbpAmount * (EXCHANGE_RATES[targetCurrency] || 1);
};

export const convertToGbp = (amount: number, sourceCurrency: string) => {
    return amount / (EXCHANGE_RATES[sourceCurrency] || 1);
};

// Keep old names for compatibility if used elsewhere
export const convertFromUsd = convertFromGbp;
export const convertToUsd = convertToGbp;

// --- ICONS ---
export const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
);
export const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
);
export const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.4l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2.4l.15.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const SignOutIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
);
export const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const EyeOffIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
);
export const RefreshCwIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
);
export const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);
export const CreditCardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
);
export const MessageCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
);
export const ShieldIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
);
export const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
export const FilterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
);
export const ProcessingLoaderIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);
export const AlertCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);
export const LandmarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="22" y2="22" /><line x1="6" x2="6" y1="18" y2="11" /><line x1="10" x2="10" y1="18" y2="11" /><line x1="14" x2="14" y1="18" y2="11" /><line x1="18" x2="18" y1="18" y2="11" /><polygon points="12 2 20 7 4 7" /></svg>
);
export const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
);
export const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
);
export const ImageIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
);
export const PaperclipIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
);
export const SmileIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" /></svg>
);
export const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
);
export const LockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);
export const UserPlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>
);

export const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
);
export const PlaneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.8-.2-1.6.1-2 .8l-.6.8c-.3.6-.1 1.4.4 1.8l5.8 4.6-3.8 3.8-2.6-.6c-.5-.1-1 .1-1.3.5l-.3.3c-.3.3-.3.8 0 1.1l2.5 2.5c.3.3.8.3 1.1 0l.3-.3c.4-.3.6-.8.5-1.3l-.6-2.6 3.8-3.8 4.6 5.8c.4.5 1.2.7 1.8.4l.8-.6c.7-.4 1-1.2.8-2z"/></svg>
);
export const BILLER_CATEGORIES = [
    { 
        name: 'Book Flights', 
        icon: PlaneIcon, 
        billers: [
            'Emirates Airline (UAE & Global)',
            'Qatar Airways (Qatar & Global)',
            'Saudia Airlines (Saudi Arabia & Global)',
            'Etihad Airways (UAE & Global)',
            'British Airways (UK & Global)',
            'Air France (France & Europe)',
            'Lufthansa (Germany & Europe)',
            'Delta Air Lines (USA & Americas)',
            'United Airlines (USA & Global)',
            'American Airlines (USA & Global)',
            'Cathay Pacific (Hong Kong & Asia)',
            'Singapore Airlines (Singapore & Global)',
            'Turkish Airlines (Turkey & Global)',
            'Qantas Airways (Australia & Oceania)',
            'Air Canada (Canada & Global)',
            'Japan Airlines - JAL (Japan & Asia)',
            'ANA - All Nippon Airways (Japan & Asia)',
            'Air India (India & Global)',
            'China Southern Airlines (China & Asia)',
            'Air China (China & Global)',
            'LATAM Airlines (South America & Global)',
            'Avianca (Colombia & Americas)',
            'Ethiopian Airlines (Africa & Global)',
            'EgyptAir (Egypt & Middle East)',
            'Royal Air Maroc (Morocco & Africa)',
            'KLM Royal Dutch Airlines (Netherlands & Europe)',
            'Philippine Airlines (Philippines & Asia)',
            'Cebu Pacific Air (Philippines & Asia)',
            'Garuda Indonesia (Indonesia & Asia)',
            'Malaysia Airlines (Malaysia & Asia)',
            'Thai Airways (Thailand & Asia)',
            'Vietnam Airlines (Vietnam & Asia)',
            'Korean Air (South Korea & Global)',
            'EVA Air (Taiwan & Asia)',
            'Ryanair (Europe)',
            'EasyJet (Europe)',
            'Southwest Airlines (USA)',
            'JetBlue Airways (Americas)',
            'Air New Zealand (New Zealand & Pacific)',
            'Fiji Airways (Pacific)'
        ] 
    },
    { 
        name: 'Utilities', 
        icon: LandmarkIcon, 
        billers: [
            'Saudi Electricity Company (Saudi Arabia)', 
            'SWCC Water (Saudi Arabia)', 
            'DEWA Electricity & Water (Dubai UAE)', 
            'British Gas (United Kingdom)', 
            'EDF Energy (UK & Europe)', 
            'National Water Company (Saudi Arabia)',
            'Con Edison (United States)',
            'National Grid (UK & USA)',
            'Tokyo Electric Power (Japan)',
            'Meralco Electricity (Philippines)',
            'PLN Electricity (Indonesia)',
            'Tenaga Nasional (Malaysia)',
            'Hydro-Québec (Canada)',
            'AGL Energy (Australia)',
            'E.ON Energy (Germany & UK)'
        ] 
    },
    { 
        name: 'Communications', 
        icon: PhoneIcon, 
        billers: [
            'STC (Saudi Arabia)', 
            'Mobily (Saudi Arabia)', 
            'Zain (Middle East)', 
            'e& Etisalat (UAE)',
            'EE Mobile (United Kingdom)', 
            'Vodafone (UK & Global)', 
            'Virgin Mobile (Global)', 
            'Airtel (India & Africa)', 
            'Reliance Jio (India)', 
            'MTN Mobile (Africa)', 
            'Globe Telecom (Philippines)', 
            'Smart Communications (Philippines)',
            'Telkomsel (Indonesia)',
            'AT&T / Verizon / T-Mobile (USA)',
            'Rogers / Bell (Canada)',
            'Telstra (Australia)'
        ] 
    },
    { 
        name: 'Transport & Travel', 
        icon: RefreshCwIcon, 
        billers: [
            'Uber Rides (Global)', 
            'Careem (Middle East)', 
            'Transport for London - TfL (UK)', 
            'Lime Scooters (Global)', 
            'Bolt Ride (Europe & Africa)', 
            'Grab (Southeast Asia)',
            'Booking.com Hotels (Global)',
            'Expedia Group (Global)',
            'Airbnb Stays (Global)',
            'Agoda Travel (Asia & Global)'
        ] 
    },
    { 
        name: 'Education', 
        icon: UserIcon, 
        billers: [
            'University of London (UK)', 
            'Oxford University (UK)', 
            'Cambridge University (UK)',
            'MIT (USA)', 
            'Harvard University (USA)', 
            'Stanford University (USA)',
            'National University of Singapore (NUS)',
            'University of Hong Kong (HKU)',
            'University of Toronto (Canada)',
            'University of Sydney (Australia)'
        ] 
    },
];
