import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FilePlus2,
  FolderOpen,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import DraftsPanel from "@/components/note/DraftsPanel";
import NoteForm from "@/components/note/NoteForm";
import NoteSheet from "@/components/note/NoteSheet";
import { tafqeet } from "@/lib/tafqeet";
import { describeNote, loadStore, makeId, nextDocNumber, persistStore } from "@/lib/storage";
import type { NoteData, SavedNote } from "@/lib/types";
import { createEmptyNote } from "@/lib/types";

const A4_WIDTH_PX = 793.7;
const A4_HEIGHT_PX = 1122.5;
type Stage = "form" | "result";

export default function Home() {
  const [initialStore] = useState(() => loadStore());
  const [data, setData] = useState<NoteData>(initialStore.current);
  const [saved, setSaved] = useState<SavedNote[]>(initialStore.saved);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draftsOpen, setDraftsOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("form");
  const [savedPulse, setSavedPulse] = useState(false);
  const [fitScale, setFitScale] = useState(0.46);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (persistStore({ current: data, saved })) {
        setSavedPulse(true);
        window.setTimeout(() => setSavedPulse(false), 1400);
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [data, saved]);

  useEffect(() => {
    if (stage !== "result") return;
    const element = resultRef.current;
    if (!element) return;

    const measure = () => {
      const available = element.clientWidth - 24;
      setFitScale(Math.min(1, Math.max(0.28, available / A4_WIDTH_PX)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [stage]);

  const update = useCallback(<K extends keyof NoteData>(key: K, value: NoteData[K]) => {
    setData((previous) => {
      const next = { ...previous, [key]: value } as NoteData;
      if (next.autoWords && (key === "amount" || key === "currency" || key === "autoWords")) {
        next.amountWords = tafqeet(next.amount, next.currency);
      }
      return next;
    });
  }, []);

  const handleCreate = () => {
    if (!data.amount.trim() || !data.payerName.trim()) {
      toast.error("أكمل البيانات الأساسية", {
        description: "يرجى إدخال المبلغ واسم محرر السند قبل الإنشاء.",
      });
      return;
    }

    const entry: SavedNote = {
      id: activeId ?? makeId(),
      title: describeNote(data),
      updatedAt: Date.now(),
      data: { ...data },
    };
    setSaved((previous) =>
      previous.some((note) => note.id === entry.id)
        ? previous.map((note) => (note.id === entry.id ? entry : note))
        : [entry, ...previous],
    );
    setActiveId(entry.id);
    setStage("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success(activeId ? "تم تحديث السند" : "تم إنشاء السند", {
      description: `رقم ${data.docNumber || "—"}`,
    });
  };

  const handleNew = () => {
    const activeNote = saved.find((note) => note.id === activeId);
    const hasUncreatedContent = !activeId && [data.payerName, data.amount, data.payee, data.payerAddress].some((value) => value.trim());
    const hasActiveChanges = Boolean(activeNote && JSON.stringify(activeNote.data) !== JSON.stringify(data));

    if (hasUncreatedContent && !window.confirm("البيانات الحالية لم تُنشأ بعد. هل تريد بدء سند جديد واستبدالها؟")) return;
    if (hasActiveChanges && activeNote) {
      const updated = { ...activeNote, title: describeNote(data), updatedAt: Date.now(), data: { ...data } };
      setSaved((previous) => previous.map((note) => note.id === activeNote.id ? updated : note));
    }

    const number = nextDocNumber(data, saved);
    setData(createEmptyNote(number));
    setActiveId(null);
    setStage("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.info("سند جديد", { description: `رقم السند ${number}` });
  };

  const handleOpenNote = (note: SavedNote) => {
    setData(note.data);
    setActiveId(note.id);
    setDraftsOpen(false);
    setStage("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success("تم فتح السند", { description: `رقم ${note.data.docNumber || "—"}` });
  };

  const handleDuplicate = (note: SavedNote) => {
    const docNumber = nextDocNumber(note.data, saved);
    const copyData = { ...note.data, docNumber };
    const copy: SavedNote = {
      id: makeId(),
      title: describeNote(copyData),
      updatedAt: Date.now(),
      data: copyData,
    };
    setSaved((previous) => [copy, ...previous]);
    setData(copy.data);
    setActiveId(copy.id);
    setDraftsOpen(false);
    setStage("result");
    toast.success("تم تكرار السند", { description: `رقم ${copy.data.docNumber}` });
  };

  const handleDelete = (id: string) => {
    const target = saved.find((note) => note.id === id);
    if (!window.confirm(`حذف السند رقم ${target?.data.docNumber || ""} نهائيًا؟`)) return;
    setSaved((previous) => previous.filter((note) => note.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setStage("form");
    }
    toast.success("تم حذف السند");
  };

  const handlePrint = () => window.print();

  return (
    <div className="studio-shell app-shell min-h-screen" dir="rtl">
      <header className="app-header no-print">
        <div className="app-header__inner">
          <div className="app-brand">
            <div className="seal" aria-hidden="true">س</div>
            <div>
              <div className="app-brand__name">مكتب السرور</div>
              <div className="app-brand__sub">إصدار سند لأمر</div>
            </div>
          </div>
          <div className="app-header__actions">
            <button type="button" onClick={() => setDraftsOpen(true)} className="btn-ghost header-action">
              <FolderOpen className="h-4 w-4" />
              <span>السندات</span>
              <span className="action-count">{saved.length}</span>
            </button>
            <button type="button" onClick={handleNew} className="btn-ghost header-action">
              <FilePlus2 className="h-4 w-4" />
              <span>سند جديد</span>
            </button>
          </div>
        </div>
      </header>

      {stage === "form" ? (
        <main className="form-screen no-print">
          <div className="form-container">
            <div className="form-intro">
              <div className="step-kicker"><span>١</span> إدخال البيانات <i /> <span className="step-kicker__muted">٢</span> إصدار وطباعة</div>
              <h1>بيانات السند</h1>
              <p>أدخل بيانات السند، ثم أنشئه لعرض النسخة النهائية وطباعتها.</p>
            </div>

            <form onSubmit={(event) => { event.preventDefault(); handleCreate(); }}>
              <NoteForm data={data} onChange={update} />
              <div className="form-submit panel-card">
                <div>
                  <div className="form-submit__title">جاهز لإصدار السند؟</div>
                  <div className="form-submit__hint">
                    {savedPulse ? "تم حفظ التغييرات على هذا الجهاز" : "بياناتك محفوظة تلقائيًا على هذا الجهاز"}
                  </div>
                </div>
                <button type="submit" className="btn-ink create-button">
                  <CheckCircle2 className="h-5 w-5" />
                  {activeId ? "حفظ التعديلات وعرض السند" : "إنشاء السند"}
                </button>
              </div>
            </form>
          </div>
        </main>
      ) : (
        <main className="result-screen">
          <div className="result-container">
            <div className="result-heading no-print">
              <div className="result-heading__copy">
                <div className="step-kicker step-kicker--success"><CheckCircle2 className="h-4 w-4" /> تم إنشاء السند</div>
                <h1>السند رقم {data.docNumber || "—"}</h1>
                <p>راجع النسخة النهائية أدناه، ويمكنك الرجوع للتعديل أو الطباعة.</p>
              </div>
              <div className="result-actions">
                <button type="button" onClick={() => setStage("form")} className="btn-ghost result-action">
                  <ArrowLeft className="h-4 w-4" /> تعديل البيانات
                </button>
                <button type="button" onClick={handlePrint} className="btn-ink result-action result-action--primary">
                  <Printer className="h-4 w-4" /> طباعة السند
                </button>
              </div>
            </div>

            <div ref={resultRef} className="result-paper-stage">
              <div
                className="result-paper"
                style={{ width: A4_WIDTH_PX * fitScale, height: A4_HEIGHT_PX * fitScale }}
              >
                <div className="sheet-scale" style={{ "--sheet-scale": fitScale } as React.CSSProperties}>
                  <NoteSheet data={data} />
                </div>
              </div>
            </div>
            <div className="result-footnote no-print">هذه معاينة السند بعد إنشائه — اطبعها على ورق A4.</div>
          </div>
        </main>
      )}

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
