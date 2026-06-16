import { useState } from "react";
import { useList, useCreate, useDelete, useInvalidate } from "@refinedev/core";
import { Plus, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
  toastStore,
} from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { formatMoneyKopecks } from "@/shared/lib/utils";

type TabKey = "sources" | "tags" | "services";

const TABS: { key: TabKey; label: string }[] = [
  { key: "sources", label: "Источники" },
  { key: "tags", label: "Теги" },
  { key: "services", label: "Услуги" },
];

export function SettingsPage() {
  const [tab, setTab] = useState<TabKey>("sources");

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Настройки</h1>
        <p className="text-sm text-muted-foreground">Справочники клиники</p>
      </div>

      <div className="inline-flex gap-1 rounded-md bg-muted p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "sources" && <SourcesTab />}
      {tab === "tags" && <TagsTab />}
      {tab === "services" && <ServicesTab />}
    </div>
  );
}

function useDict<T extends { id: string }>(resource: string) {
  const invalidate = useInvalidate();
  const { data, isLoading } = useList<T>({ resource, pagination: { mode: "off" } });
  const { mutate: create, isLoading: creating } = useCreate();
  const { mutate: remove } = useDelete();
  const refresh = () => invalidate({ resource, invalidates: ["list"] });
  const add = (values: Record<string, unknown>, onDone: () => void) =>
    create(
      { resource, values, successNotification: false },
      {
        onSuccess: () => { toastStore.push({ message: "Добавлено", type: "success" }); refresh(); onDone(); },
        onError: () => toastStore.push({ message: "Не удалось добавить", type: "error" }),
      },
    );
  const del = (id: string) =>
    remove(
      { resource, id, successNotification: false },
      { onSuccess: () => { toastStore.push({ message: "Удалено", type: "success" }); refresh(); } },
    );
  return { items: data?.data ?? [], isLoading, add, del, creating };
}

function SourcesTab() {
  const { items, isLoading, add, del, creating } = useDict<{ id: string; code: string; title: string }>("patient-sources");
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label>Код</Label>
            <Input className="w-40" value={code} onChange={(e) => setCode(e.target.value)} placeholder="site" />
          </div>
          <div className="space-y-1.5">
            <Label>Название</Label>
            <Input className="w-56" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Сайт" />
          </div>
          <Button
            disabled={creating || !code.trim() || !title.trim()}
            onClick={() => add({ code: code.trim(), title: title.trim() }, () => { setCode(""); setTitle(""); })}
          >
            <Plus className="h-4 w-4" /> Добавить
          </Button>
        </div>
        <DictTable
          isLoading={isLoading}
          head={["Код", "Название"]}
          rows={items.map((s) => ({ id: s.id, cells: [s.code, s.title] }))}
          onDelete={del}
        />
      </CardContent>
    </Card>
  );
}

function TagsTab() {
  const { items, isLoading, add, del, creating } = useDict<{ id: string; label: string; color: string }>("patient-tags");
  const [label, setLabel] = useState("");
  const [color, setColor] = useState("#3b82f6");
  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label>Название</Label>
            <Input className="w-56" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="VIP" />
          </div>
          <div className="space-y-1.5">
            <Label>Цвет</Label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-14 rounded border" />
          </div>
          <Button disabled={creating || !label.trim()} onClick={() => add({ label: label.trim(), color }, () => setLabel(""))}>
            <Plus className="h-4 w-4" /> Добавить
          </Button>
        </div>
        <DictTable
          isLoading={isLoading}
          head={["Тег", "Цвет"]}
          rows={items.map((t) => ({
            id: t.id,
            cells: [
              <Badge key="b" variant="secondary" style={{ backgroundColor: `${t.color}22`, color: t.color }}>{t.label}</Badge>,
              t.color,
            ],
          }))}
          onDelete={del}
        />
      </CardContent>
    </Card>
  );
}

function ServicesTab() {
  const { items, isLoading, add, del, creating } = useDict<{
    id: string; code: string; title: string; category: string; duration_min: number; price_kopecks: number;
  }>("services");
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("30");
  const [price, setPrice] = useState("");
  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label>Код</Label>
            <Input className="w-32" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Название</Label>
            <Input className="w-48" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Категория</Label>
            <Input className="w-40" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Мин.</Label>
            <Input className="w-20" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Цена, ₽</Label>
            <Input className="w-28" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <Button
            disabled={creating || !code.trim() || !title.trim()}
            onClick={() =>
              add(
                {
                  code: code.trim(),
                  title: title.trim(),
                  category: category.trim(),
                  duration_min: Number(duration) || 30,
                  price_kopecks: Math.round((Number(price) || 0) * 100),
                },
                () => { setCode(""); setTitle(""); setCategory(""); setDuration("30"); setPrice(""); },
              )
            }
          >
            <Plus className="h-4 w-4" /> Добавить
          </Button>
        </div>
        <DictTable
          isLoading={isLoading}
          head={["Код", "Название", "Категория", "Длит.", "Цена"]}
          rows={items.map((s) => ({
            id: s.id,
            cells: [s.code, s.title, s.category, `${s.duration_min} мин`, formatMoneyKopecks(s.price_kopecks)],
          }))}
          onDelete={del}
        />
      </CardContent>
    </Card>
  );
}

function DictTable({
  isLoading,
  head,
  rows,
  onDelete,
}: {
  isLoading: boolean;
  head: string[];
  rows: { id: string; cells: React.ReactNode[] }[];
  onDelete: (id: string) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {head.map((h) => <TableHead key={h}>{h}</TableHead>)}
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && (
          <TableRow><TableCell colSpan={head.length + 1}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
        )}
        {!isLoading && rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={head.length + 1} className="py-8 text-center text-muted-foreground">
              Записей нет
            </TableCell>
          </TableRow>
        )}
        {!isLoading && rows.map((r) => (
          <TableRow key={r.id}>
            {r.cells.map((c, i) => <TableCell key={i}>{c}</TableCell>)}
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => onDelete(r.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
