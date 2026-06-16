import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Textarea,
  toastStore,
} from "@/shared/ui";
import { http } from "@/shared/api/http";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  patientId: string;
  onSaved: () => void;
}

export function AddNoteDialog({ open, onOpenChange, patientId, onSaved }: Props) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await http.post(`/patients/${patientId}/add-note/`, { note: text.trim() });
      toastStore.push({ message: "Комментарий добавлен", type: "success" });
      setText("");
      onSaved();
      onOpenChange(false);
    } catch {
      toastStore.push({ message: "Не удалось сохранить комментарий", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Комментарий врача</DialogTitle>
          <DialogDescription>Рекомендация или заметка попадёт в историю пациента.</DialogDescription>
        </DialogHeader>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Текст комментария..." />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Отмена</Button>
          <Button onClick={submit} disabled={saving || !text.trim()}>Добавить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
