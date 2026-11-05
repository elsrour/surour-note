import { formatAmount } from "@/lib/tafqeet";
import type { NoteData } from "@/lib/types";

type BlankProps = {
  value?: string;
  variant?: "grow" | "day" | "month" | "year" | "amount" | "words";
};

/** سطر منقّط يُكتب فوقه في النموذج المطبوع */
function Blank({ value, variant = "grow" }: BlankProps) {
  return (
    <span className={`sheet-fld sheet-fld--${variant}`} data-empty={value && value.trim() ? "false" : "true"}>
      {value && value.trim() ? value : "\u00A0"}
    </span>
  );
}

type RowProps = {
  label: string;
  value?: string;
};

function Row({ label, value }: RowProps) {
  return (
    <div className="sheet-row">
      <span className="sheet-row__label">{label}</span>
      <span className="sheet-row__line">{value && value.trim() ? value : "\u00A0"}</span>
    </div>
  );
}

type GuarantorProps = {
  title: string;
  name: string;
  id: string;
  address: string;
  side: "first" | "second";
};

function Guarantor({ title, name, id, address, side }: GuarantorProps) {
  return (
    <section className={`guarantor guarantor--${side}`}>
      <h3 className="guarantor__title">{title}</h3>
      <Row label="الاسم :" value={name} />
      <Row label="رقم الهوية :" value={id} />
      <Row label="العنوان :" value={address} />
      <Row label="توقيعه :" value="" />
    </section>
  );
}

export default function NoteSheet({ data }: { data: NoteData }) {
  const amount = formatAmount(data.amount);
  const officeLine = [data.officePhone, data.officeAddress].filter(Boolean).join("  •  ");

  return (
    <article className="sheet" dir="rtl" aria-label="سند لأمر">
      <div className="sheet-frame">
        <div className="sheet-number">{data.docNumber ? `${data.docNumber}.` : "\u00A0"}</div>

        <div className="sheet-content">
          {data.showLetterhead && (
            <header className="sheet-letterhead">
              <div className="sheet-letterhead__name">{data.officeName}</div>
              {data.officeSubtitle && (
                <div className="sheet-letterhead__sub">{data.officeSubtitle}</div>
              )}
            </header>
          )}

          <div className="sheet-heading">
            <h1 className="sheet-title">{data.docTitle}</h1>
            <div className="sheet-rule" />
          </div>

          <div className="sheet-body">
            <div className="sheet-line">
              <span className="sheet-txt">حُرر هذا السند في مدينة</span>
              <Blank value={data.city} />
              <span className="sheet-txt">بتاريخ</span>
              <Blank value={data.hijriDay} variant="day" />
              <span className="sheet-slash">/</span>
              <Blank value={data.hijriMonth} variant="month" />
              <span className="sheet-slash">/</span>
              <Blank value={data.hijriYear} variant="year" />
              <span className="sheet-txt">هـ مبلغ</span>
              <span className="sheet-paren">(</span>
              <Blank value={amount} variant="amount" />
              <span className="sheet-paren">)</span>
              <span className="sheet-txt">{data.currency}</span>
            </div>

            <div className="sheet-line">
              <span className="sheet-txt">أتعهد بأن أدفع هذا السند لأمر /</span>
              <Blank value={data.payee} />
            </div>

            <div className="sheet-line">
              <span className="sheet-txt">المبلغ الموضح أعلاه وقدره</span>
              <span className="sheet-paren">(</span>
              <Blank value={data.amountWords} variant="words" />
              <span className="sheet-paren">)</span>
              <span className="sheet-txt">فقط لا غير</span>
            </div>

            {data.gregorian && <p className="sheet-gregorian">الموافق {data.gregorian} ميلادي</p>}

            <p className="sheet-due">{data.duePhrase}</p>

            <div className="sheet-rows">
              <Row label="الاسم :" value={data.payerName} />
              <Row label="رقم الهوية :" value={data.payerId} />
              <Row label="العنوان :" value={data.payerAddress} />
              <Row label="توقيع المحرر :" value="" />
            </div>

            <div className="sheet-guarantors">
              <Guarantor
                side="first"
                title={data.guarantor1Title}
                name={data.g1Name}
                id={data.g1Id}
                address={data.g1Address}
              />
              <Guarantor
                side="second"
                title={data.guarantor2Title}
                name={data.g2Name}
                id={data.g2Id}
                address={data.g2Address}
              />
            </div>

            {data.showNotes && data.notes && <p className="sheet-notes">{data.notes}</p>}

            <footer className="sheet-foot">
              {data.footerBoxText && <div className="sheet-stamp">{data.footerBoxText}</div>}
              {data.showFooter && officeLine && (
                <div className="sheet-office-foot">
                  <span>{data.officeName}</span>
                  {data.officeAddress && <span>{data.officeAddress}</span>}
                  {data.officePhone && <span>هاتف: {data.officePhone}</span>}
                </div>
              )}
            </footer>
          </div>
        </div>
      </div>
    </article>
  );
}
