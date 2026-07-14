export type SpecialistStatus = "ON DUTY" | "OFF DUTY";

export type Specialist = {
  role: string;
  status: SpecialistStatus;
};

export type Hospital = {
  id: string;
  name: string;
  hub: string;
  distanceKm: number;
  etaMin: number;
  icuAvailable: number;
  icuTotal: number;
  oxygenBeds: number;
  generalBeds: number;
  specialists: Specialist[];
  imageUrl: string;
  lat: number;
  lng: number;
  mapEmbedUrl: string;
};

export const INDORE_HUBS = [
  "Vijay Nagar",
  "LIG Square",
  "Bhawarkuan",
  "Palasia",
] as const;

export type Hub = (typeof INDORE_HUBS)[number];

export const HOSPITALS: Hospital[] = [
  {
    id: "hsp-001",
    name: "Apollo Emergency Wing",
    hub: "Vijay Nagar",
    distanceKm: 2.4,
    etaMin: 6,
    icuAvailable: 3,
    icuTotal: 10,
    oxygenBeds: 12,
    generalBeds: 34,
    specialists: [
      { role: "Cardiologist", status: "ON DUTY" },
      { role: "Neurologist", status: "OFF DUTY" },
      { role: "Trauma Surgeon", status: "ON DUTY" },
    ],
    imageUrl:
      "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEHWzbZe3gIh2MTFiX7CMjBSCsFHgHrplS4ndSAfXmjL2MuoTI9wjKUWrVtoTRrvB2zlIj5MjPgCr016Azx02mC06yc_vbvb0eWAk7VHWd3knFgXOeWWHa144BqGDprS3hrgakxIcexGijT=w426-h240-k-no",
    lat: 22.7589,
    lng: 75.8879,
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d117734.79305984473!2d75.7327023972656!3d22.757501899999994!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396303bd0d6aa29f%3A0x17b069d0af3202ff!2sApollo%20Hospitals%20%7C%20Best%20Hospital%20in%20Indore!5e0!3m2!1sen!2sin!4v1784018808232!5m2!1sen!2sin",
  },
  {
    id: "hsp-002",
    name: "CHL Critical Care Center",
    hub: "LIG Square",
    distanceKm: 3.8,
    etaMin: 9,
    icuAvailable: 0,
    icuTotal: 14,
    oxygenBeds: 4,
    generalBeds: 8,
    specialists: [
      { role: "Cardiologist", status: "OFF DUTY" },
      { role: "Neurologist", status: "ON DUTY" },
      { role: "Pulmonologist", status: "ON DUTY" },
    ],
    imageUrl:
      "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFiy3vUIb70dzgAbb4A6Jhxfe7XSojfNtr6L3ATK-ZRdLLS3CYqbdit8jhzreBT5Dp0O9-bSmIMy50mzWXBZS3-6q2UJL-5qD-2iUQraEbIn3tvBBVQCFFYJ0xgSK0cSIFUhbNezA=w412-h240-k-no",
    lat: 22.7122,
    lng: 75.88,
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d29435.95621830428!2d75.87336818653404!3d22.74702175903036!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fd4f4dca1777%3A0x62bc8f8b155a8bd8!2sCARE%20CHL%20Hospitals%20Indore%20%7C%20Best%20Hospital%20in%20Indore!5e0!3m2!1sen!2sin!4v1784019376529!5m2!1sen!2sin",
  },
  {
    id: "hsp-003",
    name: "Bombay Hospital Trauma Unit",
    hub: "Bhawarkuan",
    distanceKm: 5.1,
    etaMin: 13,
    icuAvailable: 7,
    icuTotal: 18,
    oxygenBeds: 22,
    generalBeds: 51,
    specialists: [
      { role: "Cardiologist", status: "ON DUTY" },
      { role: "Neurologist", status: "ON DUTY" },
      { role: "Orthopedic", status: "OFF DUTY" },
    ],
    imageUrl:
      "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHFRieMWtjHHT_NLU_UKoAVoDy3N0Qs6S35najvDj-w5dSihFnyCmaRbItOy6jsjVjlFySx_UdrUC1Qwl_17cZ796qcyMMzQmiZCeY5vzChVxwht0Q4CmedGUWH1E_eyLYzMo9Uv913olls=w408-h259-k-no",
    lat: 22.7299,
    lng: 75.86,
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3679.293238470076!2d75.90099277476243!3d22.75449637628009!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39631d54503f21d3%3A0xc114629679b13584!2sBombay%20Hospital!5e0!3m2!1sen!2sin!4v1784019555619!5m2!1sen!2sin",
  },
  {
    id: "hsp-004",
    name: "Choithram Hospital",
    hub: "Palasia",
    distanceKm: 4.2,
    etaMin: 11,
    icuAvailable: 2,
    icuTotal: 9,
    oxygenBeds: 9,
    generalBeds: 17,
    specialists: [
      { role: "Cardiologist", status: "ON DUTY" },
      { role: "Neurologist", status: "OFF DUTY" },
      { role: "Nephrologist", status: "ON DUTY" },
    ],
    imageUrl:
      "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGM9gqZUDnxJF37elkaefy1VLQErxyCRQv55chlX_xzVAGgx_ky5pOpbhMJ9IBs6wdDPp6bpH2VhhiHwP3O3AZswzGQZBjw5ees33qH0FQlPepIkQJ3zQ5PWo5ugZCTCfXh4B8=w408-h306-k-no",
    lat: 22.73,
    lng: 75.91,
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d58892.37238458134!2d75.77226709389257!3d22.699482611159524!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fd072fc57783%3A0x87cd7c50fde2db84!2sChoithram%20Hospital%20%26%20Research%20Centre!5e0!3m2!1sen!2sin!4v1784019680335!5m2!1sen!2sin",
  },
  {
    id: "hsp-005",
    name: "Medanta Rapid Response",
    hub: "Vijay Nagar",
    distanceKm: 1.9,
    etaMin: 5,
    icuAvailable: 5,
    icuTotal: 12,
    oxygenBeds: 15,
    generalBeds: 40,
    specialists: [
      { role: "Cardiologist", status: "ON DUTY" },
      { role: "Neurologist", status: "ON DUTY" },
      { role: "Trauma Surgeon", status: "OFF DUTY" },
    ],
    imageUrl:
      "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWl3wQLRC-WTpdzGNordIs-7OBo_IOjLVC14Kaisa6Ct6J9uCAtlxLm5_DdQDD5ili7JqM7uFhg8iQenwg1MWpJBRKcDkcS5LkFkhA7HgFE_2m-F0QLCf9jm8IGCRnw78lg-HKQ5hAyfaF4d=w408-h306-k-no",
    lat: 22.7619,
    lng: 75.89,
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3679.44043669257!2d75.89341062476223!3d22.749030576481836!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fd5596143bb7%3A0xa0053666a6c0dd5f!2sMedanta%20Super%20Specialty%20Hospital%20%7C%20Best%20Hospital%20in%20Indore!5e0!3m2!1sen!2sin!4v1784020254855!5m2!1sen!2sin",
  },
];

export type Triage = "CRITICAL" | "SERIOUS" | "STABLE";

export type IncomingUnit = {
  id: string;
  vehicle: string;
  hub: string;
  triage: Triage;
  etaSeconds: number;
  hr: number;
  spo2: number;
  systolic: number;
  diastolic: number;
  status: "AVAILABLE" | "BUSY";
};

export type BookingStatus =
  | "requested"
  | "accepted"
  | "patient_received"
  | "completed";

export type EmergencyBooking = {
  bookingId: string;
  ambulanceId: string;
  hospitalId: string;
  patientName: string;
  status: BookingStatus;
  createdAt?: string;
  acceptedAt?: string;
  patientReceivedAt?: string;
  completedAt?: string;
  receivingHospitalId?: string;
};

export const INCOMING_UNITS: IncomingUnit[] = [
  {
    id: "amb-01",
    vehicle: "MP-09-AB-1234",
    hub: "Vijay Nagar",
    triage: "CRITICAL",
    etaSeconds: 434,
    hr: 138,
    spo2: 88,
    systolic: 92,
    diastolic: 58,
    status: "AVAILABLE",
  },
  {
    id: "amb-02",
    vehicle: "MP-09-CD-5678",
    hub: "Palasia",
    triage: "SERIOUS",
    etaSeconds: 612,
    hr: 104,
    spo2: 94,
    systolic: 128,
    diastolic: 82,
    status: "BUSY",
  },
  {
    id: "amb-03",
    vehicle: "MP-09-EF-9012",
    hub: "LIG Square",
    triage: "STABLE",
    etaSeconds: 848,
    hr: 82,
    spo2: 98,
    systolic: 118,
    diastolic: 76,
    status: "AVAILABLE",
  },
];
