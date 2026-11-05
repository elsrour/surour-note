export type NoteData = {
  /* ترويسة المكتب */
  officeName: string;
  officeSubtitle: string;
  officePhone: string;
  officeAddress: string;
  showLetterhead: boolean;
  showFooter: boolean;

  /* بيانات السند */
  docTitle: string;
  docNumber: string;
  city: string;
  hijriDay: string;
  hijriMonth: string;
  hijriYear: string;
  gregorian: string;

  /* المبلغ */
  amount: string;
  amountWords: string;
  autoWords: boolean;
  currency: string;

  /* أطراف السند */
  payee: string;
  payerName: string;
  payerId: string;
  payerAddress: string;
  duePhrase: string;

  /* الكفيل الأول */
  guarantor1Title: string;
  g1Name: string;
  g1Id: string;
  g1Address: string;

  /* الكفيل الثاني */
  guarantor2Title: string;
  g2Name: string;
  g2Id: string;
  g2Address: string;

  /* التذييل */
  footerBoxText: string;
  notes: string;
  showNotes: boolean;
};

export type SavedNote = {
  id: string;
  title: string;
  updatedAt: number;
  data: NoteData;
};

export type Store = {
  current: NoteData;
  saved: SavedNote[];
};

/** التاريخ الهجري (أم القرى) والميلادي لليوم الحالي */
export function todayDates(): { hijriDay: string; hijriMonth: string; hijriYear: string; gregorian: string } {
  const now = new Date();
  const toLatin = (input: string) =>
    input
      .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
      .replace(/[\u200e\u200f\u202a-\u202e]/g, "");

  let day = "";
  let month = "";
  let year = "";

  try {
    const parts = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      timeZone: "Asia/Riyadh",
    }).formatToParts(now);

    day = toLatin(parts.find((part) => part.type === "day")?.value ?? "");
    month = toLatin(parts.find((part) => part.type === "month")?.value ?? "");
    year = toLatin(parts.find((part) => part.type === "year")?.value ?? "").replace(/\D/g, "");
  } catch {
    /* تجاهل: تُترك الحقول فارغة إذا لم يدعم المتصفح التقويم الهجري */
  }

  const gregorian = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Riyadh",
  }).format(now);

  return { hijriDay: day, hijriMonth: month, hijriYear: year, gregorian: toLatin(gregorian) };
}

export function createEmptyNote(number = "48201"): NoteData {
  const dates = todayDates();

  return {
    officeName: "مكتب السرور",
    officeSubtitle: "للخدمات القانونية والتعقيب",
    officePhone: "0555000000",
    officeAddress: "الرياض – المملكة العربية السعودية",
    showLetterhead: true,
    showFooter: false,

    docTitle: "سند لأمر",
    docNumber: number,
    city: "الرياض",
    hijriDay: dates.hijriDay,
    hijriMonth: dates.hijriMonth,
    hijriYear: dates.hijriYear,
    gregorian: "",

    amount: "",
    amountWords: "",
    autoWords: true,
    currency: "ريال سعودي",

    payee: "",
    payerName: "",
    payerId: "",
    payerAddress: "",
    duePhrase: "ويستحق تحت الطلب",

    guarantor1Title: "الكفيل الضامن الأول",
    g1Name: "",
    g1Id: "",
    g1Address: "",

    guarantor2Title: "الكفيل الضامن الثاني",
    g2Name: "",
    g2Id: "",
    g2Address: "",

    footerBoxText: "لحاملة حق الرجوع دون مصاريف أو احتجاج",
    notes: "",
    showNotes: false,
  };
}
