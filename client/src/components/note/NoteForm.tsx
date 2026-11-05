import type { ReactNode } from "react";
import type { NoteData } from "@/lib/types";
import { todayDates } from "@/lib/types";

type Props = {
  data: NoteData;
  onChange: <K extends keyof NoteData>(key: K, value: NoteData[K]) => void;
};

function Section({
  title,
  index,
  children,
}: {
  title: string;
  index: number;
  children: ReactNode;
}) {
  return (
    <section className="panel-card p-4">
      <div className="section-title mb-3">
        <span className="section-index">{index}</span>
        <span>{title}</span>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="field-label mb-1.5 flex items-center justify-between gap-2">
        <span>{label}</span>
        {hint && <span className="font-normal text-[0.7rem] text-[#a49b88]">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`flex w-full items-center justify-between gap-2 rounded-[10px] border px-3 py-2 text-[0.8rem] font-semibold transition ${
        checked
          ? "border-[#12326b]/40 bg-[#12326b]/[0.06] text-[#12326b]"
          : "border-[#ddd5c5] bg-white text-[#7a7364]"
      }`}
    >
      <span>{label}</span>
      <span
        className={`relative h-4 w-7 rounded-full transition ${
          checked ? "bg-[#12326b]" : "bg-[#d6cfc0]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all ${
            checked ? "right-0.5" : "right-3.5"
          }`}
        />
      </span>
    </button>
  );
}

export default function NoteForm({ data, onChange }: Props) {
  const fillToday = () => {
    const dates = todayDates();
    onChange("hijriDay", dates.hijriDay);
    onChange("hijriMonth", dates.hijriMonth);
    onChange("hijriYear", dates.hijriYear);
    onChange("gregorian", dates.gregorian);
  };

  return (
    <div className="space-y-3 pb-24">
      <Section index={1} title="بيانات السند">
        <div className="grid grid-cols-2 gap-2">
          <Field label="عنوان السند">
            <input
              className="field-input"
              value={data.docTitle}
              onChange={(event) => onChange("docTitle", event.target.value)}
            />
          </Field>
          <Field label="رقم السند">
            <input
              className="field-input"
              value={data.docNumber}
              onChange={(event) => onChange("docNumber", event.target.value)}
              inputMode="numeric"
            />
          </Field>
        </div>
        <Field label="مدينة التحرير">
          <input
            className="field-input"
            value={data.city}
            onChange={(event) => onChange("city", event.target.value)}
            placeholder="الرياض"
          />
        </Field>
        <div>
          <div className="field-label mb-1.5 flex items-center justify-between">
            <span>التاريخ الهجري</span>
            <button
              type="button"
              onClick={fillToday}
              className="rounded-md border border-[#d8d0c0] bg-white px-2 py-0.5 text-[0.68rem] font-semibold text-[#12326b] hover:border-[#12326b]/40"
            >
              تاريخ اليوم
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <input
                className="field-input text-center"
                value={data.hijriDay}
                onChange={(event) => onChange("hijriDay", event.target.value)}
                inputMode="numeric"
                aria-label="اليوم"
                placeholder="00"
              />
              <span className="mt-1 block text-center text-[0.66rem] text-[#8c8371]">اليوم</span>
            </div>
            <div>
              <input
                className="field-input text-center"
                value={data.hijriMonth}
                onChange={(event) => onChange("hijriMonth", event.target.value)}
                inputMode="numeric"
                aria-label="الشهر"
                placeholder="00"
              />
              <span className="mt-1 block text-center text-[0.66rem] text-[#8c8371]">الشهر</span>
            </div>
            <div>
              <input
                className="field-input text-center"
                value={data.hijriYear}
                onChange={(event) => onChange("hijriYear", event.target.value)}
                inputMode="numeric"
                aria-label="السنة"
                placeholder="0000"
              />
              <span className="mt-1 block text-center text-[0.66rem] text-[#8c8371]">السنة</span>
            </div>
          </div>
        </div>
        <Field label="التاريخ الميلادي (اختياري)">
          <input
            className="field-input"
            value={data.gregorian}
            onChange={(event) => onChange("gregorian", event.target.value)}
            placeholder="00/00/0000"
          />
        </Field>
      </Section>

      <Section index={2} title="المبلغ">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Field label="المبلغ رقمًا">
            <input
              className="field-input text-left"
              dir="ltr"
              value={data.amount}
              onChange={(event) => onChange("amount", event.target.value)}
              inputMode="decimal"
              placeholder="45000"
            />
          </Field>
          <Field label="العملة">
            <input
              className="field-input w-28"
              value={data.currency}
              onChange={(event) => onChange("currency", event.target.value)}
            />
          </Field>
        </div>
        <Toggle
          label="كتابة المبلغ تلقائيًا بالحروف"
          checked={data.autoWords}
          onChange={(value) => onChange("autoWords", value)}
        />
        <Field label="المبلغ كتابةً" hint={data.autoWords ? "تلقائي" : "يدوي"}>
          <textarea
            className="field-input min-h-[72px] resize-y leading-6"
            value={data.amountWords}
            onChange={(event) => onChange("amountWords", event.target.value)}
            readOnly={data.autoWords}
            placeholder="تُكتب تلقائيًا من المبلغ رقمًا"
          />
        </Field>
      </Section>

      <Section index={3} title="المحرر (المدين) والمستفيد">
        <Field label="اسم المحرر">
          <input
            className="field-input"
            value={data.payerName}
            onChange={(event) => onChange("payerName", event.target.value)}
            placeholder="الاسم الثلاثي"
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="رقم الهوية">
            <input
              className="field-input text-left"
              dir="ltr"
              value={data.payerId}
              onChange={(event) => onChange("payerId", event.target.value)}
              inputMode="numeric"
            />
          </Field>
          <Field label="المستفيد (لأمر)">
            <input
              className="field-input"
              value={data.payee}
              onChange={(event) => onChange("payee", event.target.value)}
              placeholder="اسم المستفيد"
            />
          </Field>
        </div>
        <Field label="عنوان المحرر">
          <input
            className="field-input"
            value={data.payerAddress}
            onChange={(event) => onChange("payerAddress", event.target.value)}
          />
        </Field>
        <Field label="عبارة الاستحقاق">
          <input
            className="field-input"
            value={data.duePhrase}
            onChange={(event) => onChange("duePhrase", event.target.value)}
          />
        </Field>
      </Section>

      <Section index={4} title="التذييل والملاحظات">
        <Field label="نص الصندوق السفلي">
          <input
            className="field-input"
            value={data.footerBoxText}
            onChange={(event) => onChange("footerBoxText", event.target.value)}
          />
        </Field>
        <Toggle
          label="إظهار ملاحظات في الورقة"
          checked={data.showNotes}
          onChange={(value) => onChange("showNotes", value)}
        />
        {data.showNotes && (
          <textarea
            className="field-input min-h-[80px] resize-y leading-6"
            value={data.notes}
            onChange={(event) => onChange("notes", event.target.value)}
            placeholder="شروط أو ملاحظات إضافية تظهر على السند"
          />
        )}
      </Section>
    </div>
  );
}
