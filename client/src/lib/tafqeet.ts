/**
 * تحويل المبلغ الرقمي إلى كلمات عربية (تفقيط) بصياغة مناسبة للسندات.
 */

const ONES = [
  "",
  "واحد",
  "اثنان",
  "ثلاثة",
  "أربعة",
  "خمسة",
  "ستة",
  "سبعة",
  "ثمانية",
  "تسعة",
  "عشرة",
  "أحد عشر",
  "اثنا عشر",
  "ثلاثة عشر",
  "أربعة عشر",
  "خمسة عشر",
  "ستة عشر",
  "سبعة عشر",
  "ثمانية عشر",
  "تسعة عشر",
];

const TENS = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];

const HUNDREDS = [
  "",
  "مئة",
  "مئتان",
  "ثلاثمئة",
  "أربعمئة",
  "خمسمئة",
  "ستمئة",
  "سبعمئة",
  "ثمانمئة",
  "تسعمئة",
];

type Scale = {
  value: number;
  single: string;
  dual: string;
  plural: string;
  accusative: string;
};

const SCALES: Scale[] = [
  { value: 1_000_000_000, single: "مليار", dual: "ملياران", plural: "مليارات", accusative: "مليارًا" },
  { value: 1_000_000, single: "مليون", dual: "مليونان", plural: "ملايين", accusative: "مليونًا" },
  { value: 1_000, single: "ألف", dual: "ألفان", plural: "آلاف", accusative: "ألفًا" },
];

/** 0..999 إلى كلمات */
function threeDigitsToWords(value: number): string {
  const parts: string[] = [];
  const hundreds = Math.floor(value / 100);
  const rest = value % 100;

  if (hundreds > 0) parts.push(HUNDREDS[hundreds]);

  if (rest > 0) {
    if (rest < 20) {
      parts.push(ONES[rest]);
    } else {
      const tens = Math.floor(rest / 10);
      const units = rest % 10;
      parts.push(units > 0 ? `${ONES[units]} و${TENS[tens]}` : TENS[tens]);
    }
  }

  return parts.join(" و");
}

function groupToWords(count: number, scale: Scale): string {
  if (count === 1) return scale.single;
  if (count === 2) return scale.dual;
  if (count >= 3 && count <= 10) return `${threeDigitsToWords(count)} ${scale.plural}`;
  return `${threeDigitsToWords(count)} ${scale.accusative}`;
}

function integerToWords(value: number): string {
  if (value === 0) return "صفر";

  const parts: string[] = [];
  let remaining = value;

  for (const scale of SCALES) {
    const count = Math.floor(remaining / scale.value);
    if (count > 0) {
      parts.push(groupToWords(count, scale));
      remaining -= count * scale.value;
    }
  }

  if (remaining > 0) parts.push(threeDigitsToWords(remaining));

  return parts.join(" و");
}

function halalasToWords(halalas: number): string {
  if (halalas === 1) return "هللة واحدة";
  if (halalas === 2) return "هللتان";
  if (halalas <= 10) return `${threeDigitsToWords(halalas)} هللات`;
  return `${threeDigitsToWords(halalas)} هللة`;
}

/**
 * يحوّل مبلغًا مثل "45750.50" إلى:
 * «خمسة وأربعون ألفًا وسبعمئة وخمسون ريالًا سعوديًا وخمسون هللة»
 */
export function tafqeet(raw: string | number, currency = "ريال سعودي"): string {
  const numeric =
    typeof raw === "number"
      ? raw
      : Number(
          String(raw)
            .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
            .replace(/[,\s]/g, ""),
        );

  if (!Number.isFinite(numeric)) return "";

  const absolute = Math.abs(numeric);
  const integer = Math.floor(absolute);
  const halalas = Math.round((absolute - integer) * 100);

  let text = `${integerToWords(integer)} ${currency}`;
  if (halalas > 0) text += ` و${halalasToWords(halalas)}`;

  return text;
}

/** صياغة كاملة داخل الجملة: «فقط خمسة ... لا غير» */
export function tafqeetSentence(raw: string | number, currency = "ريال سعودي"): string {
  const words = tafqeet(raw, currency);
  return words ? `فقط ${words} لا غير` : "";
}

const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/** يضيف فواصل الآلاف ويبقي الأرقام لاتينية */
export function formatAmount(raw: string): string {
  const cleaned = String(raw)
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)))
    .replace(/[^\d.]/g, "");

  const [integerPart, decimalPart] = cleaned.split(".");
  const grouped = (integerPart ?? "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (decimalPart === undefined) return grouped;
  return `${grouped}.${decimalPart.slice(0, 2)}`;
}
