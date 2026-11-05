import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FilePlus2,
  FolderOpen,
  Minus,
  Plus,
  Printer,
  Save,
  Scan,
  Eye,
  PenLine,
} from "lucide-react";
import { toast } from "sonner";
import DraftsPanel from "@/components/note/DraftsPanel";
import NoteForm from "@/components/note/NoteForm";
import NoteSheet from "@/components/note/NoteSheet";
import { tafqeet } from "@/lib/tafqeet";
import {
  describeNote,
  loadStore,
  makeId,
  nextDocNumber,
  persistStore,
} from "@/lib/storage";
import type { NoteData, SavedNote } from "@/lib/types";
import { createEmptyNote } from "@/lib/types";

const A4_WIDTH_PX = 793.7;

export default function Home() {
  const [initialStore] = useState(() => loadStore());
  const [data, setData] = useState<NoteData>(initialStore.current);
  const [saved, setSaved] = useState<SavedNote[]>(initialStore.saved);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draftsOpen, setDraftsOpen] = useState(false);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [zoom, setZoom] = useState<number | "fit">("fit");
  const [fitScale, setFitScale] = useState(0.62);
  const [savedPulse, setSavedPulse] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  /* ملاءمة عرض المعاينة */
  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;

    const measure = () => {
      const available = element.clientWidth - 72;
      setFitScale(Math.min(1, Math.max(0.3, available / A4_WIDTH_PX)));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  /* حفظ تلقائي */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const ok = persistStore({ current: data, saved });
      if (ok) {
        setSavedPulse(true);
        window.setTimeout(() => setSavedPulse(false), 1200);
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [data, saved]);

  const update = useCallback(<K extends keyof NoteData>(key: K, value: NoteData[K]) => {
    setData((previous) => {
      const next = { ...previous, [key]: value } as NoteData;

      const shouldRecalculate =
        next.autoWords && (key === "amount" || key === "currency" || key === "autoWords");

      if (shouldRecalculate) {
        next.amountWords = tafqeet(next.amount, next.currency);
      }

      return next;
    });
  }, []);

  const handleSave = () => {
    const now = Date.now();
    const id = activeId ?? makeId();
    const entry: SavedNote = {
      id,
      title: describeNote(data),
      updatedAt: now,
      data,
    };

    setSaved((previous) => {
      const exists = previous.some((note) => note.id === id);
      return exists
        ? previous.map((note) => (note.id === id ? entry : note))
        : [entry, ...previous];
    });
    setActiveId(id);
    toast.success("تم حفظ السند", { description: `رقم ${data.docNumber || "—"}` });
  };

  const handleNew = () => {
    const number = nextDocNumber(data, saved);
    const fresh = createEmptyNote(number);
    fresh.officeName = data.officeName;
    fresh.officeSubtitle = data.officeSubtitle;
    fresh.officePhone = data.officePhone;
    fresh.officeAddress = data.officeAddress;
    fresh.showLetterhead = data.showLetterhead;
    fresh.showFooter = data.showFooter;
    fresh.city = data.city;
    fresh.currency = data.currency;
    setData(fresh);
    setActiveId(null);
    toast.info("سند جديد", { description: `رقم السند ${number}` });
  };

  const handleOpenNote = (note: SavedNote) => {
    setData(note.data);
    setActiveId(note.id);
    setDraftsOpen(false);
    setTab("preview");
    toast.success("تم فتح السند", { description: `رقم ${note.data.docNumber || "—"}` });
  };

  const handleDuplicate = (note: SavedNote) => {
    const copy: SavedNote = {
      id: makeId(),
      title: describeNote(note.data),
      updatedAt: Date.now(),
      data: { ...note.data, docNumber: nextDocNumber(note.data, saved) },
    };
    setSaved((previous) => [copy, ...previous]);
    setData(copy.data);
    setActiveId(copy.id);
    setDraftsOpen(false);
    toast.success("تم تكرار السند", { description: `رقم ${copy.data.docNumber}` });
  };

  const handleDelete = (id: string) => {
    const target = saved.find((note) => note.id === id);
    const confirmed = window.confirm(`حذف السند رقم ${target?.data.docNumber || ""} نهائيًا؟`);
    if (!confirmed) return;

    setSaved((previous) => previous.filter((note) => note.id !== id));
    if (activeId === id) setActiveId(null);
    toast.success("تم حذف السند");
  };

  const handlePrint = () => {
    window.print();
  };

  const scale = zoom === "fit" ? fitScale : zoom;

  const generatedWords = useMemo(
    () => (data.autoWords ? tafqeet(data.amount, data.currency) : data.amountWords),
    [data.amount, data.currency, data.autoWords, data.amountWords],
  );

  const wordsMissing = data.amount.trim() !== "" && generatedWords.trim() === "";

  return (
    <div className="studio-shell app-shell flex min-h-screen flex-col">
      {/* ================= الشريط العلوي ================= */}
      <header className="no-print sticky top-0 z-30 border-b border-[#ded6c6]/80 bg-[#fbf8f2]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1500px] flex-wrap items-center gap-3 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="seal" aria-hidden="true">
              س
            </div>
            <div className="leading-tight">
              <div className="font-['Naskh'] text-[1.15rem] font-bold text-[#12326b]">
                {data.officeName || "مكتب السرور"}
              </div>
              <div className="text-[0.68rem] tracking-wide text-[#8c8371]">
                منشئ سند لأمر · جاهز للطباعة
              </div>
            </div>
          </div>

          <div className="mr-auto flex items-center gap-1.5 sm:gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-[#d9d1c1] bg-white/70 px-2.5 py-1 text-[0.68rem] font-semibold text-[#5a6a8c] lg:flex">
              <Scan className="h-3 w-3" /> A4 · 210×297mm
            </span>
            <button
              type="button"
              onClick={handleNew}
              className="btn-ghost flex items-center gap-1.5 px-2.5 py-2 text-[0.8rem] sm:px-3"
              aria-label="سند جديد"
            >
              <FilePlus2 className="h-4 w-4" /> <span className="hidden sm:inline">سند جديد</span>
            </button>
            <button
              type="button"
              onClick={() => setDraftsOpen(true)}
              className="btn-ghost flex items-center gap-1.5 px-2.5 py-2 text-[0.8rem] sm:px-3"
              aria-label="السندات المحفوظة"
            >
              <FolderOpen className="h-4 w-4" /> <span className="hidden sm:inline">سنداتي</span>
              <span className="rounded-full bg-[#12326b]/10 px-1.5 text-[0.68rem] text-[#12326b]">
                {saved.length}
              </span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-ghost flex items-center gap-1.5 px-2.5 py-2 text-[0.8rem] sm:px-3"
              aria-label="حفظ"
            >
              <Save className="h-4 w-4" /> <span className="hidden sm:inline">حفظ</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="btn-ink flex items-center gap-1.5 px-3 py-2 text-[0.82rem] sm:px-4 sm:text-[0.85rem]"
            >
              <Printer className="h-4 w-4 sm:h-[1.05rem] sm:w-[1.05rem]" />
              <span className="hidden xs:inline sm:inline">طباعة</span>
            </button>
          </div>
        </div>

        {/* تبويبات الجوال */}
        <div className="flex gap-1 border-t border-[#e6dfd0] px-3 py-1.5 lg:hidden">
          <button
            type="button"
            onClick={() => setTab("edit")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[0.78rem] font-semibold ${
              tab === "edit" ? "bg-[#12326b] text-white" : "text-[#5a6a8c]"
            }`}
          >
            <PenLine className="h-3.5 w-3.5" /> البيانات
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[0.78rem] font-semibold ${
              tab === "preview" ? "bg-[#12326b] text-white" : "text-[#5a6a8c]"
            }`}
          >
            <Eye className="h-3.5 w-3.5" /> المعاينة
          </button>
        </div>
      </header>

      <main className="app-main mx-auto flex w-full max-w-[1500px] flex-1 flex-col lg:flex-row">
        {/* ================= المحرر ================= */}
        <aside
          className={`no-print w-full shrink-0 border-l border-[#e2dbcb] bg-[#f7f3ea]/60 lg:w-[392px] lg:overflow-y-auto lg:h-[calc(100vh-64px)] ${
            tab === "edit" ? "block" : "hidden lg:block"
          }`}
        >
          <div className="sticky top-0 z-10 border-b border-[#e6dfd0] bg-[#f7f3ea]/95 px-4 py-2.5 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[0.92rem] font-bold text-[#12326b]">بيانات السند</h1>
                <p className="text-[0.7rem] text-[#8c8371]">
                  {savedPulse ? "جارٍ حفظ المسودة تلقائيًا…" : "كل تعديل يظهر فورًا في الورقة"}
                </p>
              </div>
              {wordsMissing && (
                <span className="rounded-md bg-[#a4242b]/10 px-2 py-1 text-[0.65rem] font-semibold text-[#a4242b]">
                  راجع المبلغ
                </span>
              )}
            </div>
          </div>

          <div className="p-3">
            <NoteForm data={data} onChange={update} />
          </div>
        </aside>

        {/* ================= المعاينة ================= */}
        <section
          className={`preview-col relative flex min-h-[60vh] flex-1 flex-col lg:h-[calc(100vh-64px)] ${
            tab === "preview" ? "flex" : "hidden lg:flex"
          }`}
        >
          <div className="preview-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />

          <div className="no-print relative z-10 flex items-center justify-between gap-3 px-4 py-2.5">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/55">
              معاينة الطباعة
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/10 p-1 backdrop-blur">
              <button
                type="button"
                onClick={() => setZoom((value) => Math.max(0.3, (value === "fit" ? fitScale : value) - 0.1))}
                className="grid h-6 w-6 place-items-center rounded text-white/80 hover:bg-white/15"
                aria-label="تصغير"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[46px] text-center text-[0.7rem] font-semibold text-white/80">
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((value) => Math.min(1.4, (value === "fit" ? fitScale : value) + 0.1))}
                className="grid h-6 w-6 place-items-center rounded text-white/80 hover:bg-white/15"
                aria-label="تكبير"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoom("fit")}
                className={`rounded px-2 py-1 text-[0.66rem] font-semibold ${
                  zoom === "fit" ? "bg-white text-[#12326b]" : "text-white/75 hover:bg-white/15"
                }`}
              >
                ملاءمة
              </button>
            </div>
          </div>

          <div ref={stageRef} className="preview-stage relative z-10 flex-1 overflow-auto px-4 pb-10">
            <div className="preview-paper mx-auto" style={{ width: A4_WIDTH_PX * scale }}>
              <div
                className="sheet-scale"
                style={{ "--sheet-scale": scale } as React.CSSProperties}
              >
                <NoteSheet data={data} />
              </div>
            </div>
            <p className="no-print mx-auto mt-4 max-w-md text-center text-[0.68rem] leading-5 text-white/40">
              الورقة معاينة حقيقية بمقاس A4 — الطباعة تُخرج السند وحده دون أي عناصر من الواجهة.
            </p>
          </div>
        </section>
      </main>

      <DraftsPanel
        open={draftsOpen}
        saved={saved}
        activeId={activeId}
        onClose={() => setDraftsOpen(false)}
        onOpenNote={handleOpenNote}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />
    </div>
  );
}
