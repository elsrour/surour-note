import { Copy, FileText, Trash2, X } from "lucide-react";
import type { SavedNote } from "@/lib/types";

type Props = {
  open: boolean;
  saved: SavedNote[];
  activeId: string | null;
  onClose: () => void;
  onOpenNote: (note: SavedNote) => void;
  onDuplicate: (note: SavedNote) => void;
  onDelete: (id: string) => void;
};

const formatter = new Intl.DateTimeFormat("ar-SA", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function DraftsPanel({
  open,
  saved,
  activeId,
  onClose,
  onOpenNote,
  onDuplicate,
  onDelete,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="السندات المحفوظة">
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute inset-0 bg-[#0b1f45]/45 backdrop-blur-[2px]"
      />
      <div className="relative flex h-full w-full max-w-md flex-col border-r border-[#e2dbcb] bg-[#faf7f0] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e2dbcb] px-4 py-3">
          <div>
            <h2 className="section-title">السندات المحفوظة</h2>
            <p className="mt-0.5 text-[0.72rem] text-[#7a7364]">
              محفوظة على هذا الجهاز — {saved.length} سند
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#ddd5c5] bg-white p-2 text-[#445270] hover:border-[#12326b]/40"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {saved.length === 0 && (
            <div className="mt-10 rounded-xl border border-dashed border-[#d8d0c0] bg-white/60 p-6 text-center">
              <FileText className="mx-auto mb-2 h-6 w-6 text-[#b3a992]" />
              <p className="text-sm font-semibold text-[#445270]">لا توجد سندات محفوظة بعد</p>
              <p className="mt-1 text-[0.72rem] text-[#8c8371]">
                أنشئ أول سند ليُحفظ هنا وتستطيع فتحه أو طباعته لاحقًا.
              </p>
            </div>
          )}

          {saved.map((note) => (
            <div
              key={note.id}
              className={`rounded-xl border bg-white p-3 transition ${
                activeId === note.id ? "border-[#12326b]/50 shadow-sm" : "border-[#e4ddcd]"
              }`}
            >
              <button type="button" onClick={() => onOpenNote(note)} className="block w-full text-right">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-[#12326b]">
                    سند رقم {note.data.docNumber || "—"}
                  </span>
                  <span className="text-[0.68rem] text-[#a49b88]">{formatter.format(note.updatedAt)}</span>
                </div>
                <div className="mt-1 text-[0.8rem] text-[#445270]">{note.title}</div>
                <div className="mt-0.5 text-[0.7rem] text-[#8c8371]">
                  {note.data.city || "—"} · {note.data.hijriDay}/{note.data.hijriMonth}/{note.data.hijriYear} هـ
                </div>
              </button>

              <div className="mt-2 flex items-center gap-2 border-t border-[#f0ebdf] pt-2">
                <button
                  type="button"
                  onClick={() => onOpenNote(note)}
                  className="rounded-md bg-[#12326b]/[0.07] px-2 py-1 text-[0.7rem] font-semibold text-[#12326b] hover:bg-[#12326b]/[0.12]"
                >
                  فتح
                </button>
                <button
                  type="button"
                  onClick={() => onDuplicate(note)}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-[0.7rem] font-semibold text-[#5a6a8c] hover:bg-[#f2ede2]"
                >
                  <Copy className="h-3 w-3" /> تكرار
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(note.id)}
                  className="mr-auto flex items-center gap-1 rounded-md px-2 py-1 text-[0.7rem] font-semibold text-[#a4242b] hover:bg-[#a4242b]/10"
                >
                  <Trash2 className="h-3 w-3" /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
