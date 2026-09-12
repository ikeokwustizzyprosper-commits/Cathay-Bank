export interface StateProvince {
    name: string;
    zip: string;
}

export const US_STATES: StateProvince[] = [
    { name: "Alabama", zip: "35203" },
    { name: "Alaska", zip: "99501" },
    { name: "Arizona", zip: "85001" },
    { name: "Arkansas", zip: "72201" },
    { name: "California", zip: "90001" },
    { name: "Colorado", zip: "80201" },
    { name: "Connecticut", zip: "06101" },
    { name: "Delaware", zip: "19901" },
    { name: "Florida", zip: "33101" },
    { name: "Georgia", zip: "30301" },
    { name: "Hawaii", zip: "96801" },
    { name: "Idaho", zip: "83701" },
    { name: "Illinois", zip: "60601" },
    { name: "Indiana", zip: "46201" },
    { name: "Iowa", zip: "50301" },
    { name: "Kansas", zip: "66601" },
    { name: "Kentucky", zip: "40601" },
    { name: "Louisiana", zip: "70112" },
    { name: "Maine", zip: "04101" },
    { name: "Maryland", zip: "21201" },
    { name: "Massachusetts", zip: "02108" },
    { name: "Michigan", zip: "48201" },
    { name: "Minnesota", zip: "55401" },
    { name: "Mississippi", zip: "39201" },
    { name: "Missouri", zip: "63101" },
    { name: "Montana", zip: "59601" },
    { name: "Nebraska", zip: "68501" },
    { name: "Nevada", zip: "89101" },
    { name: "New Hampshire", zip: "03301" },
    { name: "New Jersey", zip: "07101" },
    { name: "New Mexico", zip: "87501" },
    { name: "New York", zip: "10001" },
    { name: "North Carolina", zip: "27601" },
    { name: "North Dakota", zip: "58501" },
    { name: "Ohio", zip: "43201" },
    { name: "Oklahoma", zip: "73101" },
    { name: "Oregon", zip: "97201" },
    { name: "Pennsylvania", zip: "19101" },
    { name: "Rhode Island", zip: "02901" },
    { name: "South Carolina", zip: "29201" },
    { name: "South Dakota", zip: "57101" },
    { name: "Tennessee", zip: "37201" },
    { name: "Texas", zip: "75001" },
    { name: "Utah", zip: "84101" },
    { name: "Vermont", zip: "05601" },
    { name: "Virginia", zip: "23219" },
    { name: "Washington", zip: "98101" },
    { name: "Washington D.C.", zip: "20001" },
    { name: "West Virginia", zip: "25301" },
    { name: "Wisconsin", zip: "53201" },
    { name: "Wyoming", zip: "82001" },
    { name: "Puerto Rico", zip: "00901" }
];

export const UK_REGIONS: StateProvince[] = [
    { name: "Greater London (England)", zip: "EC1A 1BB" },
    { name: "Greater Manchester (England)", zip: "M1 1AE" },
    { name: "West Midlands / Birmingham (England)", zip: "B1 1AA" },
    { name: "West Yorkshire / Leeds (England)", zip: "LS1 1AA" },
    { name: "Merseyside / Liverpool (England)", zip: "L1 1AA" },
    { name: "South Yorkshire / Sheffield (England)", zip: "S1 1AA" },
    { name: "Tyne and Wear / Newcastle (England)", zip: "NE1 1AA" },
    { name: "Bristol / South West (England)", zip: "BS1 1AA" },
    { name: "Cambridgeshire (England)", zip: "CB1 1AA" },
    { name: "Oxfordshire (England)", zip: "OX1 1AA" },
    { name: "Edinburgh / Lothian (Scotland)", zip: "EH1 1YZ" },
    { name: "Glasgow / Strathclyde (Scotland)", zip: "G1 1AA" },
    { name: "Aberdeenshire (Scotland)", zip: "AB10 1AA" },
    { name: "Cardiff / Glamorgan (Wales)", zip: "CF10 1EP" },
    { name: "Swansea (Wales)", zip: "SA1 1AA" },
    { name: "Belfast / County Antrim (Northern Ireland)", zip: "BT1 5GS" }
];

export const CANADA_PROVINCES: StateProvince[] = [
    { name: "Ontario", zip: "M5V 2T6" },
    { name: "Quebec", zip: "H2Y 1C6" },
    { name: "British Columbia", zip: "V6B 1A1" },
    { name: "Alberta", zip: "T2P 1J9" },
    { name: "Manitoba", zip: "R3C 0V8" },
    { name: "Saskatchewan", zip: "S4P 0S5" },
    { name: "Nova Scotia", zip: "B3H 1A1" },
    { name: "New Brunswick", zip: "E3B 1A1" },
    { name: "Newfoundland and Labrador", zip: "A1C 1A1" },
    { name: "Prince Edward Island", zip: "C1A 1A1" },
    { name: "Northwest Territories", zip: "X1A 1A1" },
    { name: "Yukon", zip: "Y1A 1A1" },
    { name: "Nunavut", zip: "X0A 0H0" }
];

export const AUSTRALIA_STATES: StateProvince[] = [
    { name: "New South Wales (Sydney)", zip: "2000" },
    { name: "Victoria (Melbourne)", zip: "3000" },
    { name: "Queensland (Brisbane)", zip: "4000" },
    { name: "Western Australia (Perth)", zip: "6000" },
    { name: "South Australia (Adelaide)", zip: "5000" },
    { name: "Tasmania (Hobart)", zip: "7000" },
    { name: "Australian Capital Territory (Canberra)", zip: "2600" },
    { name: "Northern Territory (Darwin)", zip: "0800" }
];

export const NIGERIA_STATES: StateProvince[] = [
    { name: "Lagos", zip: "100001" },
    { name: "Federal Capital Territory (Abuja)", zip: "900001" },
    { name: "Rivers (Port Harcourt)", zip: "500001" },
    { name: "Kano", zip: "700001" },
    { name: "Oyo (Ibadan)", zip: "200001" },
    { name: "Delta (Warri / Asaba)", zip: "320001" },
    { name: "Kaduna", zip: "800001" },
    { name: "Edo (Benin City)", zip: "300001" },
    { name: "Anambra (Awka / Onitsha)", zip: "420001" },
    { name: "Enugu", zip: "400001" },
    { name: "Ogun (Abeokuta)", zip: "110001" },
    { name: "Ondo (Akure)", zip: "340001" },
    { name: "Akwa Ibom (Uyo)", zip: "520001" },
    { name: "Plateau (Jos)", zip: "930001" },
    { name: "Cross River (Calabar)", zip: "540001" },
    { name: "Abia (Umuahia / Aba)", zip: "440001" },
    { name: "Imo (Owerri)", zip: "460001" },
    { name: "Kwara (Ilorin)", zip: "240001" },
    { name: "Osun (Osogbo)", zip: "230001" },
    { name: "Benue (Makurdi)", zip: "970001" },
    { name: "Bayelsa (Yenagoa)", zip: "561001" },
    { name: "Kogi (Lokoja)", zip: "260001" },
    { name: "Niger (Minna)", zip: "920001" },
    { name: "Borno (Maiduguri)", zip: "600001" },
    { name: "Sokoto", zip: "840001" },
    { name: "Katsina", zip: "820001" },
    { name: "Bauchi", zip: "740001" },
    { name: "Adamawa (Yola)", zip: "640001" },
    { name: "Ekiti (Ado-Ekiti)", zip: "360001" },
    { name: "Nasarawa (Lafia)", zip: "950001" },
    { name: "Taraba (Jalingo)", zip: "660001" },
    { name: "Ebonyi (Abakaliki)", zip: "480001" },
    { name: "Gombe", zip: "760001" },
    { name: "Jigawa (Dutse)", zip: "720001" },
    { name: "Kebbi (Birnin Kebbi)", zip: "860001" },
    { name: "Yobe (Damaturu)", zip: "620001" },
    { name: "Zamfara (Gusau)", zip: "860001" }
];

export const GERMANY_STATES: StateProvince[] = [
    { name: "Berlin", zip: "10115" },
    { name: "Bavaria (Munich)", zip: "80331" },
    { name: "Baden-Württemberg (Stuttgart)", zip: "70173" },
    { name: "North Rhine-Westphalia (Cologne / Düsseldorf)", zip: "50667" },
    { name: "Hesse (Frankfurt)", zip: "60311" },
    { name: "Hamburg", zip: "20095" },
    { name: "Lower Saxony (Hanover)", zip: "30159" },
    { name: "Saxony (Leipzig / Dresden)", zip: "01067" },
    { name: "Rhineland-Palatinate (Mainz)", zip: "55116" },
    { name: "Schleswig-Holstein (Kiel)", zip: "24103" },
    { name: "Brandenburg (Potsdam)", zip: "14467" },
    { name: "Thuringia (Erfurt)", zip: "99084" },
    { name: "Saxony-Anhalt (Magdeburg)", zip: "39104" },
    { name: "Bremen", zip: "28195" },
    { name: "Saarland (Saarbrücken)", zip: "66111" },
    { name: "Mecklenburg-Vorpommern (Rostock)", zip: "18055" }
];

export const FRANCE_REGIONS: StateProvince[] = [
    { name: "Île-de-France (Paris)", zip: "75001" },
    { name: "Auvergne-Rhône-Alpes (Lyon)", zip: "69001" },
    { name: "Provence-Alpes-Côte d'Azur (Marseille / Nice)", zip: "13001" },
    { name: "Nouvelle-Aquitaine (Bordeaux)", zip: "33000" },
    { name: "Occitanie (Toulouse / Montpellier)", zip: "31000" },
    { name: "Grand Est (Strasbourg)", zip: "67000" },
    { name: "Hauts-de-France (Lille)", zip: "59000" },
    { name: "Brittany (Rennes)", zip: "35000" },
    { name: "Pays de la Loire (Nantes)", zip: "44000" },
    { name: "Normandy (Rouen)", zip: "76000" },
    { name: "Bourgogne-Franche-Comté (Dijon)", zip: "21000" },
    { name: "Centre-Val de Loire (Tours)", zip: "37000" },
    { name: "Corsica (Ajaccio)", zip: "20000" }
];

export const UAE_EMIRATES: StateProvince[] = [
    { name: "Dubai", zip: "00000" },
    { name: "Abu Dhabi", zip: "00000" },
    { name: "Sharjah", zip: "00000" },
    { name: "Ajman", zip: "00000" },
    { name: "Ras Al Khaimah", zip: "00000" },
    { name: "Fujairah", zip: "00000" },
    { name: "Umm Al Quwain", zip: "00000" }
];

export const SAUDI_PROVINCES: StateProvince[] = [
    { name: "Riyadh Province", zip: "11564" },
    { name: "Makkah / Jeddah", zip: "21577" },
    { name: "Eastern Province (Dammam / Khobar)", zip: "31411" },
    { name: "Madinah Province", zip: "41411" },
    { name: "Asir (Abha)", zip: "61411" },
    { name: "Tabuk", zip: "71411" },
    { name: "Al Qassim (Buraidah)", zip: "51411" },
    { name: "Hail", zip: "81411" }
];

export const INDIA_STATES: StateProvince[] = [
    { name: "Maharashtra (Mumbai)", zip: "400001" },
    { name: "Delhi (National Capital Territory)", zip: "110001" },
    { name: "Karnataka (Bengaluru)", zip: "560001" },
    { name: "Tamil Nadu (Chennai)", zip: "600001" },
    { name: "Telangana (Hyderabad)", zip: "500001" },
    { name: "Gujarat (Ahmedabad)", zip: "380001" },
    { name: "West Bengal (Kolkata)", zip: "700001" },
    { name: "Uttar Pradesh (Lucknow / Noida)", zip: "226001" },
    { name: "Punjab (Chandigarh)", zip: "160001" },
    { name: "Kerala (Kochi / Thiruvananthapuram)", zip: "695001" },
    { name: "Rajasthan (Jaipur)", zip: "302001" },
    { name: "Haryana (Gurugram)", zip: "122001" },
    { name: "Madhya Pradesh (Indore / Bhopal)", zip: "462001" },
    { name: "Andhra Pradesh (Visakhapatnam)", zip: "530001" },
    { name: "Bihar (Patna)", zip: "800001" },
    { name: "Odisha (Bhubaneswar)", zip: "751001" },
    { name: "Goa (Panaji)", zip: "403001" }
];

export const SOUTH_AFRICA_PROVINCES: StateProvince[] = [
    { name: "Gauteng (Johannesburg / Pretoria)", zip: "2000" },
    { name: "Western Cape (Cape Town)", zip: "8000" },
    { name: "KwaZulu-Natal (Durban)", zip: "4000" },
    { name: "Eastern Cape (Gqeberha / East London)", zip: "6000" },
    { name: "Free State (Bloemfontein)", zip: "9300" },
    { name: "Limpopo (Polokwane)", zip: "0700" },
    { name: "Mpumalanga (Mbombela)", zip: "1200" },
    { name: "North West (Rustenburg)", zip: "0300" },
    { name: "Northern Cape (Kimberley)", zip: "8300" }
];

export const BRAZIL_STATES: StateProvince[] = [
    { name: "São Paulo", zip: "01000-000" },
    { name: "Rio de Janeiro", zip: "20000-000" },
    { name: "Minas Gerais (Belo Horizonte)", zip: "30000-000" },
    { name: "Distrito Federal (Brasília)", zip: "70000-000" },
    { name: "Bahia (Salvador)", zip: "40000-000" },
    { name: "Paraná (Curitiba)", zip: "80000-000" },
    { name: "Rio Grande do Sul (Porto Alegre)", zip: "90000-000" },
    { name: "Santa Catarina (Florianópolis)", zip: "88000-000" },
    { name: "Ceará (Fortaleza)", zip: "60000-000" },
    { name: "Pernambuco (Recife)", zip: "50000-000" }
];

export const MEXICO_STATES: StateProvince[] = [
    { name: "Ciudad de México (CDMX)", zip: "06000" },
    { name: "Jalisco (Guadalajara)", zip: "44100" },
    { name: "Nuevo León (Monterrey)", zip: "64000" },
    { name: "Puebla", zip: "72000" },
    { name: "Estado de México", zip: "50000" },
    { name: "Guanajuato (León)", zip: "36000" },
    { name: "Yucatán (Mérida)", zip: "97000" },
    { name: "Baja California (Tijuana)", zip: "22000" },
    { name: "Querétaro", zip: "76000" },
    { name: "Quintana Roo (Cancún)", zip: "77500" }
];

export const JAPAN_PREFECTURES: StateProvince[] = [
    { name: "Tokyo", zip: "100-0001" },
    { name: "Osaka", zip: "530-0001" },
    { name: "Kanagawa (Yokohama)", zip: "220-0001" },
    { name: "Aichi (Nagoya)", zip: "460-0001" },
    { name: "Kyoto", zip: "600-8001" },
    { name: "Fukuoka", zip: "810-0001" },
    { name: "Hokkaido (Sapporo)", zip: "060-0001" },
    { name: "Hyogo (Kobe)", zip: "650-0001" },
    { name: "Saitama", zip: "330-0001" },
    { name: "Chiba", zip: "260-0001" }
];

export const ITALY_REGIONS: StateProvince[] = [
    { name: "Lombardy (Milan)", zip: "20121" },
    { name: "Lazio (Rome)", zip: "00187" },
    { name: "Campania (Naples)", zip: "80133" },
    { name: "Piedmont (Turin)", zip: "10121" },
    { name: "Tuscany (Florence)", zip: "50123" },
    { name: "Veneto (Venice)", zip: "30124" },
    { name: "Emilia-Romagna (Bologna)", zip: "40121" },
    { name: "Sicily (Palermo)", zip: "90133" }
];

export const SPAIN_COMMUNITIES: StateProvince[] = [
    { name: "Community of Madrid", zip: "28001" },
    { name: "Catalonia (Barcelona)", zip: "08001" },
    { name: "Andalusia (Seville / Malaga)", zip: "41001" },
    { name: "Valencian Community", zip: "46001" },
    { name: "Basque Country (Bilbao)", zip: "48001" },
    { name: "Galicia (A Coruña)", zip: "15001" },
    { name: "Canary Islands (Las Palmas)", zip: "35001" },
    { name: "Balearic Islands (Palma)", zip: "07001" }
];

export const SWITZERLAND_CANTONS: StateProvince[] = [
    { name: "Zurich", zip: "8001" },
    { name: "Geneva", zip: "1201" },
    { name: "Bern", zip: "3001" },
    { name: "Basel-Stadt", zip: "4001" },
    { name: "Vaud (Lausanne)", zip: "1001" },
    { name: "Lucerne", zip: "6001" },
    { name: "Ticino (Lugano)", zip: "6901" },
    { name: "St. Gallen", zip: "9001" }
];

export const NETHERLANDS_PROVINCES: StateProvince[] = [
    { name: "North Holland (Amsterdam)", zip: "1012 JS" },
    { name: "South Holland (Rotterdam / The Hague)", zip: "3011 AA" },
    { name: "Utrecht", zip: "3511 EV" },
    { name: "North Brabant (Eindhoven)", zip: "5611 AA" },
    { name: "Gelderland (Arnhem)", zip: "6811 AA" },
    { name: "Overijssel (Zwolle)", zip: "8011 AA" },
    { name: "Groningen", zip: "9711 AA" },
    { name: "Limburg (Maastricht)", zip: "6211 AA" }
];

export const SINGAPORE_REGIONS: StateProvince[] = [
    { name: "Central Region (Raffles Place / Marina Bay)", zip: "018956" },
    { name: "East Region (Changi / Tampines)", zip: "460001" },
    { name: "North Region (Woodlands / Yishun)", zip: "730001" },
    { name: "West Region (Jurong)", zip: "600001" },
    { name: "North-East Region (Serangoon)", zip: "530001" }
];

export const GHANA_REGIONS: StateProvince[] = [
    { name: "Greater Accra (Accra)", zip: "GA-100" },
    { name: "Ashanti (Kumasi)", zip: "AK-001" },
    { name: "Central (Cape Coast)", zip: "CC-001" },
    { name: "Western (Takoradi)", zip: "WS-001" },
    { name: "Eastern (Koforidua)", zip: "ER-001" },
    { name: "Northern (Tamale)", zip: "NR-001" }
];

export const KENYA_COUNTIES: StateProvince[] = [
    { name: "Nairobi County", zip: "00100" },
    { name: "Mombasa County", zip: "80100" },
    { name: "Kiambu County", zip: "00900" },
    { name: "Nakuru County", zip: "20100" },
    { name: "Kisumu County", zip: "40100" },
    { name: "Uasin Gishu (Eldoret)", zip: "30100" },
    { name: "Machakos County", zip: "90100" }
];

export const PHILIPPINES_PROVINCES: StateProvince[] = [
    { name: "Metro Manila (NCR)", zip: "1000" },
    { name: "Cebu", zip: "6000" },
    { name: "Davao del Sur", zip: "8000" },
    { name: "Cavite", zip: "4100" },
    { name: "Laguna", zip: "4000" },
    { name: "Pampanga", zip: "2000" },
    { name: "Iloilo", zip: "5000" }
];

export const INDONESIA_PROVINCES: StateProvince[] = [
    { name: "DKI Jakarta", zip: "10110" },
    { name: "West Java (Bandung)", zip: "40115" },
    { name: "East Java (Surabaya)", zip: "60119" },
    { name: "Central Java (Semarang)", zip: "50134" },
    { name: "Bali (Denpasar)", zip: "80232" },
    { name: "North Sumatra (Medan)", zip: "20111" }
];

export const MALAYSIA_STATES: StateProvince[] = [
    { name: "Kuala Lumpur", zip: "50000" },
    { name: "Selangor", zip: "40000" },
    { name: "Penang", zip: "10000" },
    { name: "Johor", zip: "80000" },
    { name: "Sarawak", zip: "93000" },
    { name: "Sabah", zip: "88000" },
    { name: "Perak", zip: "30000" }
];

export const EGYPT_GOVERNORATES: StateProvince[] = [
    { name: "Cairo Governorate", zip: "11511" },
    { name: "Alexandria Governorate", zip: "21500" },
    { name: "Giza Governorate", zip: "12511" },
    { name: "Port Said", zip: "42511" },
    { name: "Suez", zip: "43511" },
    { name: "Red Sea (Hurghada)", zip: "84511" }
];

export const TURKEY_PROVINCES: StateProvince[] = [
    { name: "Istanbul", zip: "34000" },
    { name: "Ankara", zip: "06000" },
    { name: "Izmir", zip: "35000" },
    { name: "Antalya", zip: "07000" },
    { name: "Bursa", zip: "16000" }
];

export const IRELAND_COUNTIES: StateProvince[] = [
    { name: "County Dublin", zip: "D01 A1B2" },
    { name: "County Cork", zip: "T12 A1B2" },
    { name: "County Galway", zip: "H91 A1B2" },
    { name: "County Limerick", zip: "V94 A1B2" },
    { name: "County Kildare", zip: "W91 A1B2" }
];

export const NEW_ZEALAND_REGIONS: StateProvince[] = [
    { name: "Auckland Region", zip: "1010" },
    { name: "Wellington Region", zip: "6011" },
    { name: "Canterbury (Christchurch)", zip: "8011" },
    { name: "Waikato (Hamilton)", zip: "3204" },
    { name: "Otago (Dunedin / Queenstown)", zip: "9016" }
];

export const POLAND_VOIVODESHIPS: StateProvince[] = [
    { name: "Masovian (Warsaw)", zip: "00-001" },
    { name: "Lesser Poland (Krakow)", zip: "30-001" },
    { name: "Lower Silesia (Wroclaw)", zip: "50-001" },
    { name: "Silesia (Katowice)", zip: "40-001" },
    { name: "Greater Poland (Poznan)", zip: "60-001" }
];

export const SWEDEN_COUNTIES: StateProvince[] = [
    { name: "Stockholm County", zip: "111 20" },
    { name: "Västra Götaland (Gothenburg)", zip: "411 05" },
    { name: "Skåne (Malmö)", zip: "211 19" },
    { name: "Uppsala County", zip: "753 10" }
];

export const NORWAY_COUNTIES: StateProvince[] = [
    { name: "Oslo", zip: "0150" },
    { name: "Vestland (Bergen)", zip: "5003" },
    { name: "Trøndelag (Trondheim)", zip: "7010" },
    { name: "Rogaland (Stavanger)", zip: "4005" }
];

export const DENMARK_REGIONS: StateProvince[] = [
    { name: "Capital Region (Copenhagen)", zip: "1050" },
    { name: "Central Denmark (Aarhus)", zip: "8000" },
    { name: "Southern Denmark (Odense)", zip: "5000" }
];

export const QATAR_MUNICIPALITIES: StateProvince[] = [
    { name: "Doha (Ad Dawhah)", zip: "00000" },
    { name: "Al Rayyan", zip: "00000" },
    { name: "Al Wakrah", zip: "00000" },
    { name: "Al Daayen", zip: "00000" }
];

export const KUWAIT_GOVERNORATES: StateProvince[] = [
    { name: "Capital Governorate (Al Asimah)", zip: "13001" },
    { name: "Hawalli Governorate", zip: "30000" },
    { name: "Al Farwaniyah", zip: "80000" },
    { name: "Al Ahmadi", zip: "60000" }
];

export const BAHRAIN_GOVERNORATES: StateProvince[] = [
    { name: "Capital Governorate (Manama)", zip: "301" },
    { name: "Muharraq Governorate", zip: "202" },
    { name: "Northern Governorate", zip: "502" },
    { name: "Southern Governorate", zip: "901" }
];

export const OMAN_GOVERNORATES: StateProvince[] = [
    { name: "Muscat Governorate", zip: "100" },
    { name: "Dhofar (Salalah)", zip: "211" },
    { name: "Al Batinah North", zip: "311" }
];

export const PAKISTAN_PROVINCES: StateProvince[] = [
    { name: "Sindh (Karachi)", zip: "74000" },
    { name: "Punjab (Lahore)", zip: "54000" },
    { name: "Islamabad Capital Territory", zip: "44000" },
    { name: "Khyber Pakhtunkhwa (Peshawar)", zip: "25000" },
    { name: "Balochistan (Quetta)", zip: "87300" }
];

export const ARGENTINA_PROVINCES: StateProvince[] = [
    { name: "Ciudad Autónoma de Buenos Aires (CABA)", zip: "C1000" },
    { name: "Buenos Aires Province", zip: "B1900" },
    { name: "Córdoba", zip: "X5000" },
    { name: "Santa Fe (Rosario)", zip: "S2000" },
    { name: "Mendoza", zip: "M5500" }
];

export const COLOMBIA_DEPARTMENTS: StateProvince[] = [
    { name: "Bogotá D.C.", zip: "110111" },
    { name: "Antioquia (Medellín)", zip: "050001" },
    { name: "Valle del Cauca (Cali)", zip: "760001" },
    { name: "Atlántico (Barranquilla)", zip: "080001" }
];

export const CHILE_REGIONS: StateProvince[] = [
    { name: "Santiago Metropolitan Region", zip: "8320000" },
    { name: "Valparaíso Region", zip: "2340000" },
    { name: "Biobío Region (Concepción)", zip: "4030000" }
];

export const PERU_REGIONS: StateProvince[] = [
    { name: "Lima Province", zip: "15001" },
    { name: "Arequipa", zip: "04001" },
    { name: "Cusco", zip: "08001" },
    { name: "La Libertad (Trujillo)", zip: "13001" }
];

export const PORTUGAL_DISTRICTS: StateProvince[] = [
    { name: "Lisbon District", zip: "1000-001" },
    { name: "Porto District", zip: "4000-001" },
    { name: "Faro District (Algarve)", zip: "8000-001" },
    { name: "Braga District", zip: "4700-001" }
];

export const GREECE_REGIONS: StateProvince[] = [
    { name: "Attica (Athens)", zip: "104 31" },
    { name: "Central Macedonia (Thessaloniki)", zip: "546 21" },
    { name: "Crete (Heraklion)", zip: "712 01" }
];

export const AUSTRIA_STATES: StateProvince[] = [
    { name: "Vienna (Wien)", zip: "1010" },
    { name: "Styria (Graz)", zip: "8010" },
    { name: "Upper Austria (Linz)", zip: "4020" },
    { name: "Salzburg", zip: "5020" },
    { name: "Tyrol (Innsbruck)", zip: "6020" }
];

export const BELGIUM_REGIONS: StateProvince[] = [
    { name: "Brussels-Capital Region", zip: "1000" },
    { name: "Antwerp (Flanders)", zip: "2000" },
    { name: "East Flanders (Ghent)", zip: "9000" },
    { name: "Liège (Wallonia)", zip: "4000" }
];

export const CZECH_REGIONS: StateProvince[] = [
    { name: "Prague", zip: "110 00" },
    { name: "South Moravian (Brno)", zip: "602 00" },
    { name: "Moravian-Silesian (Ostrava)", zip: "702 00" }
];

export const HUNGARY_COUNTIES: StateProvince[] = [
    { name: "Budapest", zip: "1051" },
    { name: "Pest County", zip: "2000" },
    { name: "Hajdú-Bihar (Debrecen)", zip: "4024" }
];

export const ROMANIA_COUNTIES: StateProvince[] = [
    { name: "Bucharest", zip: "010011" },
    { name: "Cluj County (Cluj-Napoca)", zip: "400001" },
    { name: "Timis County (Timisoara)", zip: "300001" }
];

export const CHINA_PROVINCES: StateProvince[] = [
    { name: "Beijing Municipality", zip: "100000" },
    { name: "Shanghai Municipality", zip: "200000" },
    { name: "Guangdong (Guangzhou / Shenzhen)", zip: "510000" },
    { name: "Zhejiang (Hangzhou)", zip: "310000" },
    { name: "Jiangsu (Nanjing / Suzhou)", zip: "210000" },
    { name: "Sichuan (Chengdu)", zip: "610000" },
    { name: "Hubei (Wuhan)", zip: "430000" }
];

export const HONG_KONG_AREAS: StateProvince[] = [
    { name: "Hong Kong Island (Central / Admiralty)", zip: "999077" },
    { name: "Kowloon (Tsim Sha Tsui / Mong Kok)", zip: "999077" },
    { name: "New Territories (Shatin / Tsuen Wan)", zip: "999077" }
];

export const TAIWAN_CITIES: StateProvince[] = [
    { name: "Taipei City", zip: "100" },
    { name: "New Taipei City", zip: "220" },
    { name: "Kaohsiung City", zip: "800" },
    { name: "Taichung City", zip: "400" },
    { name: "Tainan City", zip: "700" }
];

export const SOUTH_KOREA_PROVINCES: StateProvince[] = [
    { name: "Seoul Special City", zip: "03000" },
    { name: "Busan Metropolitan City", zip: "46000" },
    { name: "Incheon Metropolitan City", zip: "21000" },
    { name: "Gyeonggi-do (Suwon / Seongnam)", zip: "16000" },
    { name: "Daegu Metropolitan City", zip: "41000" }
];

export const THAILAND_PROVINCES: StateProvince[] = [
    { name: "Bangkok Metropolitan Area", zip: "10100" },
    { name: "Chiang Mai", zip: "50000" },
    { name: "Phuket", zip: "83000" },
    { name: "Chonburi (Pattaya)", zip: "20000" }
];

export const VIETNAM_PROVINCES: StateProvince[] = [
    { name: "Ho Chi Minh City", zip: "700000" },
    { name: "Hanoi Capital", zip: "100000" },
    { name: "Da Nang City", zip: "550000" },
    { name: "Hai Phong City", zip: "180000" }
];

export const BANGLADESH_DIVISIONS: StateProvince[] = [
    { name: "Dhaka Division", zip: "1000" },
    { name: "Chittagong Division", zip: "4000" },
    { name: "Sylhet Division", zip: "3100" },
    { name: "Rajshahi Division", zip: "6000" }
];

export const MOROCCO_REGIONS: StateProvince[] = [
    { name: "Casablanca-Settat", zip: "20000" },
    { name: "Rabat-Salé-Kénitra", zip: "10000" },
    { name: "Marrakech-Safi", zip: "40000" },
    { name: "Tanger-Tetouan-Al Hoceima", zip: "90000" }
];

export const JORDAN_GOVERNORATES: StateProvince[] = [
    { name: "Amman Governorate", zip: "11183" },
    { name: "Irbid Governorate", zip: "21110" },
    { name: "Zarqa Governorate", zip: "13110" },
    { name: "Aqaba Governorate", zip: "77110" }
];

export const LEBANON_GOVERNORATES: StateProvince[] = [
    { name: "Beirut Governorate", zip: "1107" },
    { name: "Mount Lebanon", zip: "1000" },
    { name: "North Governorate (Tripoli)", zip: "1300" }
];

export const ICELAND_REGIONS: StateProvince[] = [
    { name: "Capital Region (Reykjavík)", zip: "101" },
    { name: "Southern Peninsula (Keflavík)", zip: "230" },
    { name: "Northeastern Region (Akureyri)", zip: "600" }
];

export const CYPRUS_DISTRICTS: StateProvince[] = [
    { name: "Nicosia District", zip: "1010" },
    { name: "Limassol District", zip: "3010" },
    { name: "Larnaca District", zip: "6010" },
    { name: "Paphos District", zip: "8010" }
];

export const MALTA_REGIONS: StateProvince[] = [
    { name: "Central Region (Birkirkara)", zip: "BKR 1010" },
    { name: "Southern Harbour (Valletta)", zip: "VLT 1115" },
    { name: "Northern Region (St. Paul's Bay)", zip: "SPB 1010" }
];

export const LUXEMBOURG_CANTONS: StateProvince[] = [
    { name: "Canton of Luxembourg", zip: "L-1110" },
    { name: "Canton of Esch-sur-Alzette", zip: "L-4010" }
];

export const CROATIA_COUNTIES: StateProvince[] = [
    { name: "City of Zagreb", zip: "10000" },
    { name: "Split-Dalmatia County", zip: "21000" },
    { name: "Primorje-Gorski Kotar (Rijeka)", zip: "51000" }
];

export const BULGARIA_PROVINCES: StateProvince[] = [
    { name: "Sofia City Province", zip: "1000" },
    { name: "Plovdiv Province", zip: "4000" },
    { name: "Varna Province", zip: "9000" }
];

export const UKRAINE_OBLASTS: StateProvince[] = [
    { name: "Kyiv City", zip: "01001" },
    { name: "Lviv Oblast", zip: "79000" },
    { name: "Odesa Oblast", zip: "65000" },
    { name: "Kharkiv Oblast", zip: "61000" }
];

export const KAZAKHSTAN_REGIONS: StateProvince[] = [
    { name: "Almaty City", zip: "050000" },
    { name: "Astana City", zip: "010000" },
    { name: "Shymkent City", zip: "160000" }
];

// Helper: Get list of states/provinces with typical zip codes for ANY world country
export function getStatesAndZipForCountry(countryName: string): StateProvince[] {
    const clean = (countryName || 'United States').trim().toLowerCase();

    if (clean === 'united states' || clean === 'us' || clean === 'usa') return US_STATES;
    if (clean === 'united kingdom' || clean === 'gb' || clean === 'uk') return UK_REGIONS;
    if (clean === 'canada' || clean === 'ca') return CANADA_PROVINCES;
    if (clean === 'australia' || clean === 'au') return AUSTRALIA_STATES;
    if (clean === 'nigeria' || clean === 'ng') return NIGERIA_STATES;
    if (clean === 'germany' || clean === 'de') return GERMANY_STATES;
    if (clean === 'france' || clean === 'fr') return FRANCE_REGIONS;
    if (clean === 'united arab emirates' || clean === 'ae' || clean === 'uae') return UAE_EMIRATES;
    if (clean === 'saudi arabia' || clean === 'sa') return SAUDI_PROVINCES;
    if (clean === 'india' || clean === 'in') return INDIA_STATES;
    if (clean === 'south africa' || clean === 'za') return SOUTH_AFRICA_PROVINCES;
    if (clean === 'brazil' || clean === 'br') return BRAZIL_STATES;
    if (clean === 'mexico' || clean === 'mx') return MEXICO_STATES;
    if (clean === 'japan' || clean === 'jp') return JAPAN_PREFECTURES;
    if (clean === 'italy' || clean === 'it') return ITALY_REGIONS;
    if (clean === 'spain' || clean === 'es') return SPAIN_COMMUNITIES;
    if (clean === 'switzerland' || clean === 'ch') return SWITZERLAND_CANTONS;
    if (clean === 'netherlands' || clean === 'nl') return NETHERLANDS_PROVINCES;
    if (clean === 'singapore' || clean === 'sg') return SINGAPORE_REGIONS;
    if (clean === 'ghana' || clean === 'gh') return GHANA_REGIONS;
    if (clean === 'kenya' || clean === 'ke') return KENYA_COUNTIES;
    if (clean === 'philippines' || clean === 'ph') return PHILIPPINES_PROVINCES;
    if (clean === 'indonesia' || clean === 'id') return INDONESIA_PROVINCES;
    if (clean === 'malaysia' || clean === 'my') return MALAYSIA_STATES;
    if (clean === 'egypt' || clean === 'eg') return EGYPT_GOVERNORATES;
    if (clean === 'turkey' || clean === 'tr') return TURKEY_PROVINCES;
    if (clean === 'ireland' || clean === 'ie') return IRELAND_COUNTIES;
    if (clean === 'new zealand' || clean === 'nz') return NEW_ZEALAND_REGIONS;
    if (clean === 'poland' || clean === 'pl') return POLAND_VOIVODESHIPS;
    if (clean === 'sweden' || clean === 'se') return SWEDEN_COUNTIES;
    if (clean === 'norway' || clean === 'no') return NORWAY_COUNTIES;
    if (clean === 'denmark' || clean === 'dk') return DENMARK_REGIONS;
    if (clean === 'qatar' || clean === 'qa') return QATAR_MUNICIPALITIES;
    if (clean === 'kuwait' || clean === 'kw') return KUWAIT_GOVERNORATES;
    if (clean === 'bahrain' || clean === 'bh') return BAHRAIN_GOVERNORATES;
    if (clean === 'oman' || clean === 'om') return OMAN_GOVERNORATES;
    if (clean === 'pakistan' || clean === 'pk') return PAKISTAN_PROVINCES;
    if (clean === 'argentina' || clean === 'ar') return ARGENTINA_PROVINCES;
    if (clean === 'colombia' || clean === 'co') return COLOMBIA_DEPARTMENTS;
    if (clean === 'chile' || clean === 'cl') return CHILE_REGIONS;
    if (clean === 'peru' || clean === 'pe') return PERU_REGIONS;
    if (clean === 'portugal' || clean === 'pt') return PORTUGAL_DISTRICTS;
    if (clean === 'greece' || clean === 'gr') return GREECE_REGIONS;
    if (clean === 'austria' || clean === 'at') return AUSTRIA_STATES;
    if (clean === 'belgium' || clean === 'be') return BELGIUM_REGIONS;
    if (clean === 'czech republic' || clean === 'cz') return CZECH_REGIONS;
    if (clean === 'hungary' || clean === 'hu') return HUNGARY_COUNTIES;
    if (clean === 'romania' || clean === 'ro') return ROMANIA_COUNTIES;
    if (clean === 'china' || clean === 'cn') return CHINA_PROVINCES;
    if (clean === 'hong kong' || clean === 'hk') return HONG_KONG_AREAS;
    if (clean === 'taiwan' || clean === 'tw') return TAIWAN_CITIES;
    if (clean === 'south korea' || clean === 'kr') return SOUTH_KOREA_PROVINCES;
    if (clean === 'thailand' || clean === 'th') return THAILAND_PROVINCES;
    if (clean === 'vietnam' || clean === 'vn') return VIETNAM_PROVINCES;
    if (clean === 'bangladesh' || clean === 'bd') return BANGLADESH_DIVISIONS;
    if (clean === 'morocco' || clean === 'ma') return MOROCCO_REGIONS;
    if (clean === 'jordan' || clean === 'jo') return JORDAN_GOVERNORATES;
    if (clean === 'lebanon' || clean === 'lb') return LEBANON_GOVERNORATES;
    if (clean === 'iceland' || clean === 'is') return ICELAND_REGIONS;
    if (clean === 'cyprus' || clean === 'cy') return CYPRUS_DISTRICTS;
    if (clean === 'malta' || clean === 'mt') return MALTA_REGIONS;
    if (clean === 'luxembourg' || clean === 'lu') return LUXEMBOURG_CANTONS;
    if (clean === 'croatia' || clean === 'hr') return CROATIA_COUNTIES;
    if (clean === 'bulgaria' || clean === 'bg') return BULGARIA_PROVINCES;
    if (clean === 'ukraine' || clean === 'ua') return UKRAINE_OBLASTS;
    if (clean === 'kazakhstan' || clean === 'kz') return KAZAKHSTAN_REGIONS;

    // Standard fallback divisions for any other international sovereign territory
    return [
        { name: "Capital Territory / Main District", zip: "10000" },
        { name: "Central Province", zip: "20000" },
        { name: "Northern Region", zip: "30000" },
        { name: "Southern Region", zip: "40000" },
        { name: "Eastern Province", zip: "50000" },
        { name: "Western Province", zip: "60000" }
    ];
}
