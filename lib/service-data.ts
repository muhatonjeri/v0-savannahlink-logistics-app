// ── Moventra Service Catalogue — Kenya Market Rates 2025/2026 ──────

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  features: string[];
  popular?: boolean;
}

export interface ServiceInfo {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  packages: ServicePackage[];
  requirements: string[];
  paymentMethods: { id: string; label: string; icon: string }[];
  formFields: { id: string; label: string; type: string; required: boolean; options?: string[]; placeholder?: string }[];
  faqs: { q: string; a: string }[];
}

export const PAYMENT_METHODS = [
  { id: "mpesa", label: "M-Pesa", icon: "📱" },
  { id: "bank", label: "Bank Transfer", icon: "🏦" },
  { id: "cash", label: "Cash", icon: "💵" },
  { id: "cheque", label: "Cheque", icon: "📄" },
  { id: "card", label: "Card (Visa/Mastercard)", icon: "💳" },
];

export const SERVICES: ServiceInfo[] = [

  // 1. CAR RENTAL
  {
    id: "car-rental",
    title: "Car Rental",
    tagline: "Self Drive & Chauffeur Services",
    description: "Flexible car hire across Kenya — from economy sedans to luxury SUVs and 4x4s. Available self-drive or with a professional chauffeur. All vehicles are comprehensively insured and well-maintained.",
    icon: "🚗",
    color: "emerald",
    packages: [
      { id: "cr-economy", name: "Economy (Self-Drive)", description: "Toyota Vitz, Honda Fit, Nissan Note", price: 3500, unit: "per day", features: ["Fuel efficient", "City driving", "Manual/Auto", "Basic insurance"] },
      { id: "cr-midrange", name: "Mid-Range (Self-Drive)", description: "Toyota Fielder, Axio, Allion", price: 5000, unit: "per day", features: ["Comfortable seating", "AC", "Good fuel economy", "Comprehensive insurance"], popular: true },
      { id: "cr-suv", name: "SUV (Self-Drive)", description: "Nissan X-Trail, Mazda CX-5, Toyota RAV4", price: 8000, unit: "per day", features: ["4WD capability", "Safari ready", "7-seater option", "Comprehensive insurance"] },
      { id: "cr-prado", name: "Toyota Prado (Self-Drive)", description: "Land Cruiser Prado J150", price: 14000, unit: "per day", features: ["Premium 4x4", "Safari/upcountry", "Luxury interior", "Full insurance"] },
      { id: "cr-v8", name: "Land Cruiser V8 (Self-Drive)", description: "Toyota Land Cruiser V8/200 Series", price: 25000, unit: "per day", features: ["Ultimate 4x4", "Group travel", "Safari specialist", "Full insurance"] },
      { id: "cr-chauffeur", name: "Chauffeur Add-on", description: "Professional driver with any vehicle", price: 2500, unit: "per day", features: ["Licensed driver", "City knowledge", "24hr availability", "Airport pickups"] },
      { id: "cr-minivan", name: "Minivan (7-Seater)", description: "Toyota Noah, Voxy, Sienta", price: 7000, unit: "per day", features: ["Group travel", "Luggage space", "AC", "Comfortable"] },
      { id: "cr-luxury", name: "Luxury/Executive", description: "Mercedes, BMW, Range Rover, Lexus", price: 35000, unit: "per day", features: ["Premium brands", "VIP transfers", "Corporate use", "Full concierge"] },
    ],
    requirements: ["Valid driving license (min. 2 years)", "National ID or Passport", "KES 10,000–50,000 refundable deposit", "18+ years old", "Proof of insurance (own coverage)"],
    paymentMethods: PAYMENT_METHODS,
    formFields: [
      { id: "pickupLocation", label: "Pickup Location", type: "text", required: true, placeholder: "e.g. JKIA, Westlands, CBD" },
      { id: "dropoffLocation", label: "Drop-off Location", type: "text", required: true, placeholder: "e.g. Same as pickup / Karen / Mombasa" },
      { id: "startDate", label: "Start Date", type: "date", required: true },
      { id: "endDate", label: "End Date / Return Date", type: "date", required: true },
      { id: "driverType", label: "Driver Type", type: "select", required: true, options: ["Self-Drive", "Chauffeur Driven", "Both (I decide later)"] },
      { id: "vehicleType", label: "Vehicle Preference", type: "select", required: true, options: ["Economy", "Mid-Range Sedan", "SUV / 4x4", "Toyota Prado", "Land Cruiser V8", "Minivan (7-seater)", "Luxury / Executive"] },
      { id: "purpose", label: "Purpose of Hire", type: "select", required: false, options: ["Business / Corporate", "Safari / Upcountry", "Airport Transfer", "Family Trip", "Wedding", "Other"] },
      { id: "crossBorder", label: "Cross-Border Travel?", type: "select", required: false, options: ["No — Kenya only", "Yes — Uganda", "Yes — Tanzania", "Yes — Rwanda", "Yes — Ethiopia"] },
      { id: "additionalDrivers", label: "Additional Drivers", type: "number", required: false, placeholder: "0" },
      { id: "flightDetails", label: "Flight Number (if airport pickup)", type: "text", required: false, placeholder: "e.g. KQ101" },
      { id: "notes", label: "Special Requirements", type: "textarea", required: false, placeholder: "Child seat, roof rack, specific model, etc." },
    ],
    faqs: [
      { q: "What documents do I need?", a: "Valid driving license (at least 2 years old), National ID or Passport, and a refundable security deposit." },
      { q: "Is fuel included?", a: "No — fuel is not included. Vehicles are provided on a full-to-full fuel policy." },
      { q: "Can I take the car to Tanzania or Uganda?", a: "Yes, with advance notice. Cross-border travel requires additional insurance documentation at extra cost." },
      { q: "What happens if the car breaks down?", a: "We provide 24/7 roadside assistance. All vehicles are comprehensively insured." },
    ],
  },

  // 2. SAFARI TOURS
  {
    id: "safari-tours",
    title: "Safari Tours",
    tagline: "Kenya's Premier Wildlife Experiences",
    description: "Expertly guided safaris to Kenya's world-famous national parks and conservancies. Experience the Big Five, the Great Migration, and breathtaking landscapes with our professional driver-guides.",
    icon: "🦁",
    color: "amber",
    packages: [
      { id: "sf-daytrip", name: "Day Safari — Nairobi NP", description: "Full day game drive from Nairobi", price: 18000, unit: "per person", features: ["Nairobi National Park", "Big Five possible", "Lunch included", "Hotel pickup/dropoff"] },
      { id: "sf-2day", name: "2 Days — Amboseli", description: "Amboseli NP with Mt. Kilimanjaro views", price: 42000, unit: "per person", features: ["2 nights accommodation", "All meals", "Park fees", "Game drives"] },
      { id: "sf-3day", name: "3 Days — Masai Mara", description: "The ultimate Big Cat destination", price: 75000, unit: "per person", features: ["3 nights tented camp", "All meals", "Maasai village visit", "2 game drives/day"], popular: true },
      { id: "sf-5day", name: "5 Days — Mara + Amboseli", description: "Kenya's two iconic parks combined", price: 120000, unit: "per person", features: ["5 nights", "All inclusive", "Professional guide", "Park fees included"] },
      { id: "sf-7day", name: "7 Days — Classic Kenya", description: "Mara, Nakuru, Naivasha & Amboseli", price: 175000, unit: "per person", features: ["7 nights mid-range camps", "All inclusive", "Bird watching", "Hot air balloon option"] },
      { id: "sf-balloon", name: "Hot Air Balloon Safari", description: "Sunrise balloon over Masai Mara", price: 60000, unit: "per person", features: ["Sunrise flight", "Champagne breakfast", "Certificate", "Game drive included"] },
      { id: "sf-luxury", name: "Luxury Private Safari", description: "Exclusive private vehicle & camp", price: 280000, unit: "per person/day", features: ["Private 4x4 vehicle", "Luxury lodge", "Private chef", "Fully tailored itinerary"] },
    ],
    requirements: ["Valid passport", "Yellow fever certificate (recommended)", "Travel/medical insurance strongly advised", "Minimum age 5 years for most parks"],
    paymentMethods: PAYMENT_METHODS,
    formFields: [
      { id: "destination", label: "Destination / Park", type: "select", required: true, options: ["Masai Mara", "Amboseli NP", "Tsavo East & West", "Lake Nakuru NP", "Lake Naivasha", "Samburu NP", "Ol Pejeta Conservancy", "Meru NP", "Mt. Kenya", "Combination (multiple parks)"] },
      { id: "startDate", label: "Safari Start Date", type: "date", required: true },
      { id: "duration", label: "Duration", type: "select", required: true, options: ["1 Day (Day trip)", "2 Days / 1 Night", "3 Days / 2 Nights", "4 Days / 3 Nights", "5 Days / 4 Nights", "7 Days / 6 Nights", "10+ Days — Custom"] },
      { id: "groupSize", label: "Number of Guests", type: "number", required: true, placeholder: "e.g. 2" },
      { id: "adults", label: "Adults (15+)", type: "number", required: true, placeholder: "2" },
      { id: "children", label: "Children (Under 15)", type: "number", required: false, placeholder: "0" },
      { id: "accommodation", label: "Accommodation Level", type: "select", required: true, options: ["Budget (Camping / Basic)", "Mid-Range (Tented Camps / Lodges)", "Luxury (Premium Lodges)", "Ultra-Luxury (Exclusive Camps)"] },
      { id: "tourType", label: "Tour Type", type: "select", required: true, options: ["Group Joining Safari", "Private Safari", "Fly-in Safari", "Self-drive with Guide"] },
      { id: "inclusions", label: "Add-ons Required", type: "select", required: false, options: ["Hot Air Balloon", "Maasai Village Visit", "Bush Dinner", "Night Game Drive", "Bush Walk", "None"] },
      { id: "dietaryReqs", label: "Dietary Requirements", type: "text", required: false, placeholder: "Vegetarian, Halal, allergies, etc." },
      { id: "nationality", label: "Guest Nationality", type: "select", required: true, options: ["Kenyan Resident", "East African Citizen", "International Tourist"] },
      { id: "notes", label: "Special Requests", type: "textarea", required: false, placeholder: "Honeymoon, anniversary, specific animals, photography focus..." },
    ],
    faqs: [
      { q: "What is the best time to visit Masai Mara?", a: "July–October for the Great Wildebeest Migration. However, the Mara has excellent game viewing year-round." },
      { q: "Are park fees included?", a: "Yes — all our packages include park entry fees, accommodation, meals, and game drives as specified." },
      { q: "What vehicle is used?", a: "We use purpose-built 4x4 safari vehicles with pop-up roofs for optimal game viewing and photography." },
      { q: "Can children join safaris?", a: "Yes — most parks allow children 5+. Some luxury camps have minimum age requirements." },
    ],
  },

  // 3. HOTEL & AIRPORT TRANSFERS
  {
    id: "transfers",
    title: "Hotel & Airport Transfers",
    tagline: "Seamless Point-to-Point Transport",
    description: "Professional, punctual airport and hotel transfer services in Nairobi and across Kenya. Meet & Greet at JKIA and Wilson Airport, 24/7 availability, flight tracking included.",
    icon: "✈️",
    color: "sky",
    packages: [
      { id: "tr-jkia-cbd", name: "JKIA ↔ CBD / Hotels", description: "Jomo Kenyatta Airport to Nairobi CBD", price: 3500, unit: "one way", features: ["Meet & Greet", "Luggage handling", "Flight tracking", "45 min journey"] },
      { id: "tr-jkia-karen", name: "JKIA ↔ Karen / Langata", description: "Airport to Karen / Langata suburbs", price: 4000, unit: "one way", features: ["Professional driver", "Air-conditioned", "On-time guarantee", "24/7"] },
      { id: "tr-jkia-westlands", name: "JKIA ↔ Westlands / Gigiri", description: "Airport to Westlands, Gigiri, UN area", price: 4500, unit: "one way", features: ["Meet & Greet", "Flight tracking", "Wi-Fi vehicle option", "30–45 min"] },
      { id: "tr-wilson", name: "Wilson Airport Transfers", description: "Wilson Airport to/from any Nairobi area", price: 2500, unit: "one way", features: ["Domestic flights", "Safari connections", "Quick transfer", "Any area"] },
      { id: "tr-inter-hotel", name: "Inter-Hotel / City Transfers", description: "Between hotels and city locations", price: 2000, unit: "one way", features: ["Flexible scheduling", "Any vehicle class", "Corporate billing", "Nairobi-wide"] },
      { id: "tr-executive", name: "Executive / VIP Transfer", description: "Luxury vehicle with chauffeur", price: 8000, unit: "one way", features: ["Mercedes / BMW / Range Rover", "VIP Meet & Greet", "Red carpet service", "Any destination"] },
      { id: "tr-naivasha", name: "Nairobi ↔ Naivasha", description: "City to Lake Naivasha or Nakuru", price: 12000, unit: "one way", features: ["90 min journey", "Comfortable vehicle", "Private transfer", "Flexible pickup"] },
      { id: "tr-mombasa", name: "Nairobi ↔ Mombasa (Road)", description: "Long-distance road transfer", price: 35000, unit: "one way", features: ["8–9 hr journey", "Luxury vehicle", "Rest stops", "Driver allowance incl."] },
    ],
    requirements: ["Flight number for airport pickups", "Confirmed hotel/location address", "Contact number on arrival"],
    paymentMethods: PAYMENT_METHODS,
    formFields: [
      { id: "transferType", label: "Transfer Type", type: "select", required: true, options: ["Airport Arrival (Pick up from airport)", "Airport Departure (Drop to airport)", "Hotel to Hotel", "City Transfer", "Day Hire (Full day driver)"] },
      { id: "airport", label: "Airport", type: "select", required: false, options: ["JKIA (Jomo Kenyatta International)", "Wilson Airport (Domestic)", "Not applicable"] },
      { id: "flightNumber", label: "Flight Number", type: "text", required: false, placeholder: "e.g. KQ101 / ET316" },
      { id: "flightDate", label: "Arrival / Departure Date & Time", type: "datetime-local", required: true },
      { id: "pickupLocation", label: "Pickup Location / Terminal", type: "text", required: true, placeholder: "e.g. JKIA Terminal 1A / Serena Hotel" },
      { id: "dropoffLocation", label: "Drop-off Location", type: "text", required: true, placeholder: "e.g. Kempinski Hotel / Karen / Westlands" },
      { id: "passengers", label: "Number of Passengers", type: "number", required: true, placeholder: "1" },
      { id: "luggage", label: "Luggage / Bags", type: "number", required: false, placeholder: "2" },
      { id: "vehicleClass", label: "Vehicle Class", type: "select", required: true, options: ["Standard Sedan (1–3 pax)", "Executive Sedan (1–3 pax)", "SUV (1–4 pax)", "Minivan (5–8 pax)", "Luxury / VIP (1–3 pax)"] },
      { id: "meetGreet", label: "Meet & Greet Service", type: "select", required: false, options: ["Yes — driver meets at arrival gate", "No — I will find the vehicle"] },
      { id: "nameBoard", label: "Name for Placard / Board", type: "text", required: false, placeholder: "Name as it appears on your flight booking" },
      { id: "notes", label: "Special Instructions", type: "textarea", required: false, placeholder: "Child seat, wheelchair access, extra stops, etc." },
    ],
    faqs: [
      { q: "Do you track flights?", a: "Yes — we monitor your flight in real time and adjust pickup time for delays at no extra charge." },
      { q: "What if I miss my flight?", a: "Contact us immediately. We will reschedule at no extra cost for delays. Cancellations within 2 hours may attract a fee." },
      { q: "Is waiting time charged?", a: "We offer 60 minutes free waiting time for arrivals. Beyond that, KES 500 per 30 minutes applies." },
    ],
  },

  // 4. MOVERS
  {
    id: "movers",
    title: "Movers",
    tagline: "Safe, Reliable Home & Office Relocation",
    description: "Professional moving services across Nairobi and all Kenya counties. Packing, loading, transport, and setup at your new location. Fully trained crew with furniture protection and insurance.",
    icon: "📦",
    color: "violet",
    packages: [
      { id: "mv-bedsitter", name: "Bedsitter / Studio", description: "Single room with minimal items", price: 8000, unit: "from", features: ["2 crew members", "Standard truck", "Within Nairobi", "4–5 hr move"] },
      { id: "mv-1bed", name: "1 Bedroom House", description: "1BR house or apartment move", price: 12000, unit: "from", features: ["3 crew members", "Medium truck", "Within Nairobi", "5–6 hrs"], popular: true },
      { id: "mv-2bed", name: "2 Bedroom House", description: "2BR house full relocation", price: 20000, unit: "from", features: ["4 crew members", "Large truck", "Within Nairobi", "Full day"] },
      { id: "mv-3bed", name: "3 Bedroom House", description: "3BR house — heavy furniture", price: 28000, unit: "from", features: ["5+ crew members", "Large + small truck", "Within Nairobi", "Full day"] },
      { id: "mv-4bed", name: "4 Bedroom & Above", description: "Large home relocation", price: 40000, unit: "from", features: ["Full crew", "Multiple trucks", "Within Nairobi", "1–2 days"] },
      { id: "mv-office", name: "Office Relocation", description: "SME office move (pre-survey required)", price: 30000, unit: "from", features: ["IT equipment handling", "Furniture disassembly", "Secure transport", "Weekend moves available"] },
      { id: "mv-intercity", name: "Inter-County (Nairobi–Mombasa)", description: "Long-distance relocation", price: 60000, unit: "from", features: ["Overnight option", "Full insurance", "Driver + crew", "Door to door"] },
      { id: "mv-packing", name: "Packing Service Only", description: "Professional packing of all items", price: 5000, unit: "from", features: ["Quality packing materials", "Labelling", "Fragile item care", "Inventory list"] },
    ],
    requirements: ["Pre-move survey for 3BR+", "Clear access to pickup and drop-off", "Lifts/stairs details", "Fragile / specialty items listed in advance"],
    paymentMethods: PAYMENT_METHODS,
    formFields: [
      { id: "moveType", label: "Move Type", type: "select", required: true, options: ["Residential (House)", "Office / Commercial", "Single Items", "Storage Drop-off"] },
      { id: "houseSize", label: "House Size", type: "select", required: true, options: ["Bedsitter / Studio", "1 Bedroom", "2 Bedrooms", "3 Bedrooms", "4 Bedrooms", "5+ Bedrooms / Mansion"] },
      { id: "pickupAddress", label: "Pickup Address (Current Location)", type: "text", required: true, placeholder: "Full address including estate and apartment number" },
      { id: "dropoffAddress", label: "Drop-off Address (New Location)", type: "text", required: true, placeholder: "Full address including estate and apartment number" },
      { id: "pickupFloor", label: "Pickup Floor Level", type: "select", required: true, options: ["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor", "4th+ Floor", "Has lift/elevator"] },
      { id: "dropoffFloor", label: "Drop-off Floor Level", type: "select", required: true, options: ["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor", "4th+ Floor", "Has lift/elevator"] },
      { id: "moveDate", label: "Preferred Moving Date", type: "date", required: true },
      { id: "moveTime", label: "Preferred Start Time", type: "select", required: true, options: ["Early Morning (6AM–8AM)", "Morning (8AM–10AM)", "Late Morning (10AM–12PM)", "Afternoon (12PM–3PM)", "Flexible"] },
      { id: "packingRequired", label: "Packing Service Required?", type: "select", required: true, options: ["Yes — pack everything", "Yes — partial packing", "No — items already packed"] },
      { id: "specialItems", label: "Special / Heavy Items", type: "text", required: false, placeholder: "Piano, safe, aquarium, gym equipment, artwork..." },
      { id: "storageRequired", label: "Temporary Storage Needed?", type: "select", required: false, options: ["No", "Yes — 1–7 days", "Yes — 1–4 weeks", "Yes — Monthly"] },
      { id: "notes", label: "Additional Notes", type: "textarea", required: false, placeholder: "Narrow road access, fragile antiques, pet transport, etc." },
    ],
    faqs: [
      { q: "Do you provide packing materials?", a: "Yes — boxes, bubble wrap, stretch film, and blankets are provided. Packing materials are included or charged separately based on volume." },
      { q: "Is my furniture insured during the move?", a: "Yes — basic insurance is included. We recommend declaring high-value items in advance for additional coverage." },
      { q: "Do you move on weekends?", a: "Yes — we operate 7 days a week. Weekend moves may attract a small premium." },
      { q: "Can you move a piano?", a: "Yes — we have specialist equipment for pianos, safes, and heavy items. Please declare these in advance." },
    ],
  },

  // 5. ROAD RECOVERY
  {
    id: "road-recovery",
    title: "Road Recovery",
    tagline: "24/7 Breakdown & Towing Services Kenya-wide",
    description: "Fast, reliable roadside assistance and towing services across Kenya. Flat tires, jump starts, fuel delivery, accident recovery, and heavy-duty towing — we respond within 30 minutes in Nairobi.",
    icon: "🔧",
    color: "rose",
    packages: [
      { id: "rr-jumpstart", name: "Jump Start", description: "Battery jump start on-site", price: 1500, unit: "flat rate", features: ["30 min response (Nairobi)", "Any vehicle", "24/7 service", "No towing needed"] },
      { id: "rr-tire", name: "Flat Tyre Change", description: "Roadside tyre change service", price: 2000, unit: "flat rate", features: ["Spare tyre fitting", "Mobile service", "Any location", "24/7"] },
      { id: "rr-fuel", name: "Emergency Fuel Delivery", description: "Fuel delivered to your location", price: 2500, unit: "call-out fee", features: ["Nairobi & environs", "Petrol or Diesel", "30 min response", "Fuel cost separate"] },
      { id: "rr-lockout", name: "Car Lockout Service", description: "Locked out of your vehicle", price: 3000, unit: "flat rate", features: ["Non-destructive entry", "Any vehicle", "Nairobi area", "24/7"] },
      { id: "rr-tow-nairobi", name: "Towing — Within Nairobi", description: "Standard car tow within city", price: 5000, unit: "from", features: ["Flatbed truck", "All car types", "Certified operators", "To garage of choice"] },
      { id: "rr-tow-county", name: "Towing — Nairobi to Surrounding Counties", description: "Up to 80km radius", price: 12000, unit: "from", features: ["Thika, Kiambu, Machakos, Nakuru", "Heavy duty available", "24/7", "GPS tracked"] },
      { id: "rr-tow-longdist", name: "Long-Distance Towing", description: "Nairobi–Mombasa / Nairobi–Kisumu", price: 35000, unit: "from", features: ["400+ km range", "Heavy duty truck", "Overnight if required", "Insurance documentation"] },
      { id: "rr-heavy", name: "Heavy Vehicle Recovery", description: "Trucks, buses, matatus", price: 25000, unit: "from", features: ["Winching available", "Off-road recovery", "Highways & rural", "24/7 crew"] },
      { id: "rr-accident", name: "Accident Recovery & Scene Clearance", description: "Post-accident towing and clearance", price: 15000, unit: "from", features: ["Priority response", "Insurance coordination", "Police liaison", "Evidence preservation"] },
    ],
    requirements: ["Vehicle registration plate", "Exact location (GPS coordinates preferred)", "Vehicle type and condition description"],
    paymentMethods: PAYMENT_METHODS,
    formFields: [
      { id: "incidentType", label: "Type of Emergency", type: "select", required: true, options: ["Breakdown — Engine failure", "Flat Tyre", "Battery / Won't start", "Out of fuel", "Accident / Collision", "Locked out of vehicle", "Off-road / Stuck", "Overheating", "Other"] },
      { id: "vehicleReg", label: "Vehicle Registration", type: "text", required: true, placeholder: "e.g. KDA 123B" },
      { id: "vehicleType", label: "Vehicle Type", type: "select", required: true, options: ["Saloon Car", "SUV / 4x4", "Pickup", "Minivan", "Bus / Matatu", "Light Truck", "Heavy Truck"] },
      { id: "vehicleMake", label: "Vehicle Make & Model", type: "text", required: true, placeholder: "e.g. Toyota Corolla 2019" },
      { id: "currentLocation", label: "Current Location", type: "text", required: true, placeholder: "GPS coordinates, road name, or nearest landmark" },
      { id: "towDestination", label: "Tow Destination (if towing)", type: "text", required: false, placeholder: "Garage name and location, or leave blank for nearest" },
      { id: "contactPhone", label: "Phone Number at Scene", type: "tel", required: true, placeholder: "+254 7XX XXX XXX" },
      { id: "insurance", label: "Vehicle Insurance Company", type: "text", required: false, placeholder: "e.g. Jubilee, UAP, APA, Britam" },
      { id: "injuryStatus", label: "Are there injuries?", type: "select", required: true, options: ["No injuries", "Minor injuries (ambulance not required)", "Serious — ambulance also called"] },
      { id: "notes", label: "Additional Details", type: "textarea", required: false, placeholder: "Vehicle description, hazard warnings, special access issues..." },
    ],
    faqs: [
      { q: "How fast can you respond?", a: "Within Nairobi: under 30 minutes. Surrounding counties: 45–90 minutes. Remote areas: we will advise on ETA when you call." },
      { q: "Do you operate outside Nairobi?", a: "Yes — we cover all major highways and counties across Kenya including Mombasa Road, Thika Road, Nakuru Highway, and Western Kenya." },
      { q: "Will my insurance cover towing?", a: "Comprehensive insurance policies typically cover towing. We can work directly with your insurer. We provide all documentation needed for claims." },
    ],
  },

  // 6. CARGO HANDLING
  {
    id: "cargo-handling",
    title: "Cargo Handling",
    tagline: "Reliable Freight & Cargo Solutions",
    description: "End-to-end cargo handling services — collection, packing, warehousing, last-mile delivery, and freight forwarding across Kenya and East Africa. All cargo types handled including fragile, oversized, and hazardous.",
    icon: "📦",
    color: "orange",
    packages: [
      { id: "ch-small", name: "Small Parcel (Up to 50kg)", description: "Documents, small goods", price: 500, unit: "per delivery (Nairobi)", features: ["Same-day delivery", "Nairobi CBD", "Tracking provided", "Signature on delivery"] },
      { id: "ch-medium", name: "Medium Cargo (50–500kg)", description: "Boxes, equipment, goods", price: 3000, unit: "from", features: ["Pickup & delivery", "Nairobi & environs", "Loading crew", "Tracking"] },
      { id: "ch-large", name: "Large Cargo (500kg–3 tonnes)", description: "Pallet loads, machinery", price: 8000, unit: "from", features: ["3-tonne truck", "Crew included", "Nairobi-wide", "Insurance option"] },
      { id: "ch-truck3", name: "3 Tonne Truck (Full)", description: "Full 3-tonne truck hire", price: 12000, unit: "per day", features: ["Driver included", "Nairobi area", "Multiple drops", "Fuel separate"] },
      { id: "ch-truck7", name: "7 Tonne Truck (Full)", description: "Full 7-tonne truck hire", price: 20000, unit: "per day", features: ["Driver + crew", "Nationwide", "Heavy loads", "Insurance available"] },
      { id: "ch-refrigerated", name: "Refrigerated / Cold Chain", description: "Temperature-sensitive cargo", price: 25000, unit: "per trip", features: ["Regulated temperature", "Pharma / food grade", "Nationwide", "GPS monitored"] },
      { id: "ch-intercity", name: "Inter-City Freight", description: "Nairobi to Mombasa, Kisumu, Eldoret", price: 15000, unit: "from", features: ["Major Kenya cities", "Overnight delivery", "Tracked", "Insurance available"] },
      { id: "ch-warehouse", name: "Warehousing & Storage", description: "Short/long-term storage Nairobi", price: 5000, unit: "per week (standard bay)", features: ["Secure facility", "CCTV monitored", "Inventory management", "Easy access"] },
    ],
    requirements: ["Cargo description and weight", "Packaging details", "Pickup and delivery addresses", "Contact at both ends"],
    paymentMethods: PAYMENT_METHODS,
    formFields: [
      { id: "cargoType", label: "Cargo Type", type: "select", required: true, options: ["General Goods / Boxes", "Electronics / Appliances", "Furniture", "Construction Materials", "Agricultural Produce", "Pharma / Medical Supplies", "Refrigerated Goods", "Hazardous Materials", "Oversized / Heavy Equipment", "Documents / Parcels"] },
      { id: "cargoWeight", label: "Estimated Weight (kg)", type: "number", required: true, placeholder: "e.g. 250" },
      { id: "cargoDimensions", label: "Dimensions / Pallets", type: "text", required: false, placeholder: "e.g. 2 pallets, 1.2m x 1m x 1.5m" },
      { id: "pickupAddress", label: "Pickup / Collection Address", type: "text", required: true, placeholder: "Full address, estate, floor, contact person" },
      { id: "deliveryAddress", label: "Delivery Address", type: "text", required: true, placeholder: "Full address, estate, floor, contact person" },
      { id: "pickupDate", label: "Pickup Date", type: "date", required: true },
      { id: "deliveryDeadline", label: "Required Delivery Deadline", type: "date", required: false },
      { id: "serviceType", label: "Service Required", type: "select", required: true, options: ["Collection & Delivery", "Delivery Only (self-delivered to us)", "Collection Only", "Storage", "Freight Forwarding", "Full 3PL"] },
      { id: "fragile", label: "Fragile Items?", type: "select", required: true, options: ["No", "Yes — some fragile items", "Yes — all fragile / very delicate"] },
      { id: "insurance", label: "Cargo Insurance Required?", type: "select", required: true, options: ["Yes — please include", "No — I have own cover", "Advise me on options"] },
      { id: "cargoValue", label: "Declared Cargo Value (KES)", type: "number", required: false, placeholder: "For insurance purposes" },
      { id: "notes", label: "Special Instructions", type: "textarea", required: false, placeholder: "Handling instructions, access restrictions, contact details at destination..." },
    ],
    faqs: [
      { q: "Do you handle dangerous goods?", a: "Yes, with prior notice and proper documentation (MSDS sheets, labelling). Additional charges apply for hazardous cargo." },
      { q: "Is cargo insured?", a: "Basic transit protection is included. Full all-risk cargo insurance is available at a premium based on declared value." },
      { q: "Do you ship to Uganda/Tanzania?", a: "Yes — we handle cross-border freight to Uganda, Tanzania, Rwanda, and Ethiopia. Contact us for a custom quote." },
    ],
  },

  // 7. SHIPMENT IMPORTS
  {
    id: "shipment-imports",
    title: "Shipment Imports",
    tagline: "End-to-End Import Clearing & Forwarding",
    description: "Complete import logistics — sea and air freight clearing, KRA customs compliance, IDF processing, duty payment, and last-mile delivery from Mombasa/JKIA to your door.",
    icon: "🚢",
    color: "cyan",
    packages: [
      { id: "si-lcl", name: "LCL (Shared Container)", description: "Less-than-container-load sea freight", price: 15000, unit: "from / CBM", features: ["Mombasa port clearing", "KRA duty payment", "IDF processing", "Inland delivery"] },
      { id: "si-fcl20", name: "FCL — 20ft Container", description: "Full 20-foot container sea freight", price: 45000, unit: "clearing fee", features: ["Full container", "Port handling", "KRA clearance", "Delivery to Nairobi"] },
      { id: "si-fcl40", name: "FCL — 40ft Container", description: "Full 40-foot container sea freight", price: 65000, unit: "clearing fee", features: ["Largest container", "Heavy cargo", "Port handling", "KRA clearance"] },
      { id: "si-air", name: "Air Freight Clearing (JKIA)", description: "Air import clearing at Nairobi airport", price: 12000, unit: "from", features: ["JKIA clearance", "Fast release", "KRA compliant", "Door delivery"] },
      { id: "si-personal", name: "Personal Effects / Household", description: "Returning residents importing household goods", price: 25000, unit: "from", features: ["Duty exemption advisory", "Full customs support", "Form C31", "Inventory checking"] },
      { id: "si-vehicle", name: "Vehicle Import Clearing", description: "Import a car, lorry or machinery", price: 35000, unit: "clearing fee", features: ["KEBS inspection", "KRA duty", "NTSA registration support", "Age compliance check"] },
      { id: "si-preshipment", name: "Pre-Shipment Inspection (PVoC)", description: "Mandatory pre-shipment inspection support", price: 8000, unit: "from", features: ["KEBS PVoC compliance", "CoC certificate support", "Supplier liaison", "Document review"] },
    ],
    requirements: ["Commercial invoice", "Packing list", "Bill of Lading / Air Waybill", "Import Declaration Form (IDF)", "KRA PIN certificate"],
    paymentMethods: PAYMENT_METHODS,
    formFields: [
      { id: "freightType", label: "Freight Type", type: "select", required: true, options: ["Sea Freight — LCL (Shared)", "Sea Freight — FCL 20ft", "Sea Freight — FCL 40ft", "Air Freight (JKIA)", "Road Freight (EAC countries)"] },
      { id: "cargoDescription", label: "Cargo Description", type: "text", required: true, placeholder: "e.g. Electronics, Clothing, Machinery, Vehicles" },
      { id: "origin", label: "Country of Origin / Shipment", type: "text", required: true, placeholder: "e.g. China, UAE, UK, USA, India" },
      { id: "portOfLoading", label: "Port of Loading", type: "text", required: true, placeholder: "e.g. Shanghai, Dubai, London Heathrow" },
      { id: "portOfDischarge", label: "Port of Discharge", type: "select", required: true, options: ["Mombasa Port (Sea)", "JKIA Nairobi (Air)", "Malaba Border (Road - Uganda)", "Namanga Border (Road - Tanzania)"] },
      { id: "eta", label: "Expected Arrival Date (ETA)", type: "date", required: false },
      { id: "blNumber", label: "Bill of Lading / AWB Number", type: "text", required: false, placeholder: "If shipment is already en route" },
      { id: "cargoValue", label: "Cargo CIF Value (USD)", type: "number", required: true, placeholder: "e.g. 5000 — needed for duty calculation" },
      { id: "hsCode", label: "HS Code (if known)", type: "text", required: false, placeholder: "e.g. 8471.30 for laptops" },
      { id: "idfRequired", label: "IDF Processing Required?", type: "select", required: true, options: ["Yes — we need Moventra to process IDF", "No — we will process ourselves", "Not sure — please advise"] },
      { id: "deliveryAddress", label: "Final Delivery Address", type: "text", required: true, placeholder: "Full address in Nairobi or upcountry" },
      { id: "notes", label: "Additional Notes", type: "textarea", required: false, placeholder: "Duty exemption claims, time-sensitive clearance, special handling..." },
    ],
    faqs: [
      { q: "How long does sea freight clearing take?", a: "Typically 3–7 working days from vessel arrival at Mombasa, assuming all documents are in order." },
      { q: "Do you pay customs duty on my behalf?", a: "Yes — we advance customs duty and recover from you. Alternatively you can pay directly to KRA." },
      { q: "What is an IDF?", a: "Import Declaration Form — a mandatory KRA document for all imports above USD 2,000. We can process this for you." },
    ],
  },

  // 8. CONSTRUCTION EQUIPMENT
  {
    id: "construction-equipment",
    title: "Construction Equipment",
    tagline: "Heavy Machinery Hire for Every Project",
    description: "Professional construction equipment hire including excavators, graders, compactors, cranes, and forklifts. Operated or bare hire options available. Kenya-wide delivery.",
    icon: "🏗️",
    color: "yellow",
    packages: [
      { id: "ce-excavator", name: "Excavator (14–20 tonne)", description: "CAT / Komatsu / Hitachi", price: 45000, unit: "per day (8hrs)", features: ["Operator included", "Fuel separate", "Nairobi & upcountry", "Transport surcharge applies"] },
      { id: "ce-grader", name: "Motor Grader", description: "Road grading & levelling", price: 55000, unit: "per day", features: ["Operator included", "Road projects", "Fuel separate", "Nationwide"] },
      { id: "ce-compactor", name: "Vibratory Compactor / Roller", description: "Soil and asphalt compaction", price: 30000, unit: "per day", features: ["Operator included", "Soil/road compaction", "Various sizes", "Fuel separate"] },
      { id: "ce-bulldozer", name: "Bulldozer (D6 / D7)", description: "Land clearing and pushing", price: 50000, unit: "per day", features: ["Operator included", "Clearing, grading", "Heavy terrain", "Fuel separate"] },
      { id: "ce-crane", name: "Mobile Crane (25–50T)", description: "Lifting and placement", price: 80000, unit: "per day", features: ["Certified operator", "Load charts provided", "Site inspection required", "Insurance mandatory"] },
      { id: "ce-forklift", name: "Forklift (3–10 tonne)", description: "Warehouse and construction lifts", price: 18000, unit: "per day", features: ["Certified operator", "3–10T capacity", "Indoor/outdoor", "Fuel separate"] },
      { id: "ce-concrete", name: "Concrete Mixer / Pump", description: "Mixing and pumping concrete", price: 15000, unit: "per day", features: ["Various capacities", "Pump truck option", "Short-term hire", "Operator available"] },
      { id: "ce-lowbed", name: "Low Bed Trailer (Equipment Transport)", description: "Transport machinery to site", price: 40000, unit: "per trip (Nairobi)", features: ["Up to 50T capacity", "All machinery types", "Police escort arrangement", "Nationwide"] },
    ],
    requirements: ["Site location and access details", "Project scope and duration", "Ground condition report for cranes", "Valid operator license (bare hire)"],
    paymentMethods: PAYMENT_METHODS,
    formFields: [
      { id: "equipmentType", label: "Equipment Required", type: "select", required: true, options: ["Excavator", "Motor Grader", "Vibratory Roller / Compactor", "Bulldozer", "Mobile Crane", "Tower Crane", "Forklift", "Concrete Mixer", "Concrete Pump", "Low Bed / Equipment Transporter", "Generator", "Compressor", "Other — specify"] },
      { id: "hireType", label: "Hire Type", type: "select", required: true, options: ["Operated Hire (with certified operator)", "Bare Hire (our machine, your operator — operator CV required)"] },
      { id: "siteLocation", label: "Site Location", type: "text", required: true, placeholder: "Full address / GPS coordinates / nearest town" },
      { id: "startDate", label: "Hire Start Date", type: "date", required: true },
      { id: "duration", label: "Estimated Duration", type: "select", required: true, options: ["1 Day", "2–3 Days", "1 Week", "2 Weeks", "1 Month", "2–3 Months", "Long Term (3+ months)"] },
      { id: "workScope", label: "Scope of Work", type: "select", required: true, options: ["Excavation / Trenching", "Land Clearing", "Road Construction / Grading", "Foundation Works", "Demolition", "Lifting / Placement", "Compaction", "Loading / Offloading", "Other"] },
      { id: "soilCondition", label: "Ground / Soil Condition", type: "select", required: true, options: ["Firm / Hard ground", "Soft / Murram", "Rocky", "Waterlogged / Swampy", "Sloped terrain", "Confined space"] },
      { id: "fuelArrangement", label: "Fuel Arrangement", type: "select", required: true, options: ["Client provides fuel on site", "Moventra to supply (billed separately)", "TBD — advise"] },
      { id: "accessRoute", label: "Site Access for Heavy Machinery", type: "select", required: true, options: ["Good road access — no issues", "Narrow road — note width restrictions", "Off-road / difficult terrain", "Requires low-bed to site"] },
      { id: "projectName", label: "Project Name / Reference", type: "text", required: false, placeholder: "e.g. Ruaka Road Project / ABC Developers Phase 2" },
      { id: "notes", label: "Additional Requirements", type: "textarea", required: false, placeholder: "Shift patterns, number of machines, safety requirements, specific attachments needed..." },
    ],
    faqs: [
      { q: "Are operators included?", a: "Yes for operated hire. All operators are certified and experienced. Bare hire available with proof of operator certification." },
      { q: "Is fuel included?", a: "No — fuel is typically provided by the client on site or billed separately. We can arrange fuel supply at current market rates." },
      { q: "Do you transport equipment to site?", a: "Yes — using our low-bed trailer. Transport costs depend on distance and equipment weight. Police escort arranged for oversized loads." },
      { q: "What is the minimum hire period?", a: "Minimum 1 day (8 working hours). Half-day rates available for some equipment." },
    ],
  },

  // 9. CORPORATE RENTAL
  {
    id: "corporate-rental",
    title: "Corporate Rental",
    tagline: "Fleet Solutions for Businesses & NGOs",
    description: "Dedicated vehicle fleet management for corporates, NGOs, embassies, and institutions. Monthly and long-term contracts with dedicated account management, fuel cards, and monthly invoicing.",
    icon: "🏢",
    color: "indigo",
    packages: [
      { id: "corp-sedan", name: "Executive Sedan", description: "Toyota Axio, Corolla, Allion", price: 120000, unit: "per month", features: ["Dedicated vehicle", "Professional driver", "Insurance", "Maintenance incl."] },
      { id: "corp-suv", name: "SUV Package", description: "Toyota RAV4, Nissan X-Trail, Prado", price: 180000, unit: "per month", features: ["4WD capability", "8–10hr/day usage", "Fuel card option", "24hr emergency"], popular: true },
      { id: "corp-fleet3", name: "Fleet — 3 Vehicles", description: "Mixed fleet for teams / field work", price: 320000, unit: "per month", features: ["3 vehicles", "3 drivers", "GPS tracking", "Dedicated coordinator"] },
      { id: "corp-fleet5", name: "Fleet — 5 Vehicles", description: "Medium corporate fleet", price: 500000, unit: "per month", features: ["5 vehicles (mixed)", "5 drivers", "Monthly reporting", "Priority maintenance"] },
      { id: "corp-shuttle", name: "Staff Shuttle Service", description: "Daily staff pickup/drop routes", price: 200000, unit: "per month/route", features: ["Fixed daily routes", "Branded vehicle option", "Roster management", "Backup vehicle"] },
      { id: "corp-event", name: "Event & VIP Transport", description: "Conferences, delegations, state visits", price: 15000, unit: "per vehicle/day", features: ["Executive fleet", "Uniformed drivers", "Flag protocol capable", "24hr on standby"] },
    ],
    requirements: ["Company registration certificate", "KRA PIN certificate (company)", "Authorized signatory letter", "Signed master service agreement"],
    paymentMethods: [
      { id: "invoice", label: "Monthly Invoice", icon: "🧾" },
      { id: "bank", label: "Bank Transfer / EFT", icon: "🏦" },
      { id: "mpesa", label: "M-Pesa Business", icon: "📱" },
      { id: "cheque", label: "Company Cheque", icon: "📄" },
    ],
    formFields: [
      { id: "companyName", label: "Company / Organisation Name", type: "text", required: true, placeholder: "Full legal name" },
      { id: "companyReg", label: "Company Registration Number", type: "text", required: true, placeholder: "e.g. PVT-123456" },
      { id: "kraPin", label: "Company KRA PIN", type: "text", required: true, placeholder: "e.g. A012345678P" },
      { id: "contactPerson", label: "Contact Person / Fleet Manager", type: "text", required: true, placeholder: "Full name" },
      { id: "contactPhone", label: "Phone Number", type: "tel", required: true, placeholder: "+254 7XX XXX XXX" },
      { id: "contactEmail", label: "Official Email", type: "email", required: true, placeholder: "fleet@company.co.ke" },
      { id: "vehicleCount", label: "Number of Vehicles Required", type: "number", required: true, placeholder: "e.g. 3" },
      { id: "vehicleType", label: "Vehicle Type Preferred", type: "select", required: true, options: ["Economy Sedans", "Mid-Range Sedans", "SUVs / 4x4", "Minivans / People Carriers", "Mixed Fleet", "Buses / Minibuses"] },
      { id: "driverRequired", label: "Driver Required?", type: "select", required: true, options: ["Yes — all vehicles with drivers", "Yes — some vehicles with drivers", "No — self-driven by staff"] },
      { id: "contractDuration", label: "Contract Duration", type: "select", required: true, options: ["1 Month (Trial)", "3 Months", "6 Months", "12 Months", "24 Months", "Open-ended"] },
      { id: "usageHours", label: "Expected Daily Usage (Hours)", type: "select", required: true, options: ["Up to 4 hours/day", "4–8 hours/day", "8–10 hours/day", "10–12 hours/day", "24/7 availability"] },
      { id: "geographicScope", label: "Geographic Coverage Required", type: "select", required: true, options: ["Nairobi only", "Nairobi & surrounding counties", "Kenya-wide", "East Africa (cross-border)"] },
      { id: "fuelManagement", label: "Fuel Management", type: "select", required: true, options: ["Client manages fuel directly", "Moventra fuel card (billed monthly)", "Fuel included in rate (discuss)"] },
      { id: "billingPeriod", label: "Billing Cycle", type: "select", required: true, options: ["Monthly", "Quarterly", "Per trip / per day"] },
      { id: "notes", label: "Additional Requirements", type: "textarea", required: false, placeholder: "Special branding, GPS tracking, specific routes, SLA requirements, safety standards..." },
    ],
    faqs: [
      { q: "Do you offer fuel cards?", a: "Yes — we can provide branded fuel cards linked to specific vehicles for transparent fleet fuel management." },
      { q: "Is GPS tracking available?", a: "Yes — all corporate fleet vehicles come with real-time GPS tracking and monthly utilisation reports." },
      { q: "What is the minimum contract?", a: "Minimum 1 month for fleet contracts. We recommend 3-month trials to establish the right fleet size for your needs." },
      { q: "Are reliever vehicles available?", a: "Yes — in case of breakdown or maintenance, a replacement vehicle is provided within 4 hours." },
    ],
  },
];

export function getServiceById(id: string): ServiceInfo | undefined {
  return SERVICES.find(s => s.id === id);
}
