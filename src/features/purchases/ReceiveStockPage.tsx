import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

import { listShoes } from "../../api/shoes";
import {
  listSuppliers,
  listPackTemplates,
  receiveStock,
  type ReceiveLine,
} from "../../api/purchases";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { formatKsh } from "../../lib/format";

type SimpleLine = {
  kind: "simple";
  key: string;
  shoeId: number;
  variantId: number;
  quantity: number;
  buyingPrice: number;
};

type PackLine = {
  kind: "pack";
  key: string;
  shoeId: number;
  templateId: number;
  templateName: string;
  templateTotalPairs: number;
  packs: number;
  buyingPrice: number;
};

type Line = SimpleLine | PackLine;

let counter = 0;
const nextKey = () => `line-${Date.now()}-${counter++}`;

export default function ReceiveStockPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([]);

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: listSuppliers,
  });
  const { data: shoes = [] } = useQuery({
    queryKey: ["shoes"],
    queryFn: listShoes,
  });

  const shoeIds = Array.from(new Set(lines.map((l) => l.shoeId)));
  const { data: allTemplates = [] } = useQuery({
    queryKey: ["pack-templates", shoeIds],
    queryFn: async () => {
      const results = await Promise.all(
        shoeIds.map((id) => listPackTemplates(id))
      );
      return results.flat();
    },
    enabled: shoeIds.length > 0,
  });

  const templatesForShoe = (shoeId: number) =>
    allTemplates.filter((t) => t.shoe === shoeId);

  const shoeById = (id: number) => shoes.find((s) => s.id === id);

  const addSimpleLine = () => {
    const firstShoe = shoes.find((s) => s.variants.length > 0);
    if (!firstShoe) {
      toast.error("No shoes with sizes available.");
      return;
    }
    setLines((prev) => [
      ...prev,
      {
        kind: "simple",
        key: nextKey(),
        shoeId: firstShoe.id,
        variantId: firstShoe.variants[0].id,
        quantity: 1,
        buyingPrice: parseFloat(firstShoe.buying_price),
      },
    ]);
  };

  const addPackLine = () => {
    const firstShoe = shoes.find((s) => s.variants.length > 0);
    if (!firstShoe) {
      toast.error("No shoes available.");
      return;
    }
    setLines((prev) => [
      ...prev,
      {
        kind: "pack",
        key: nextKey(),
        shoeId: firstShoe.id,
        templateId: 0,
        templateName: "",
        templateTotalPairs: 0,
        packs: 1,
        buyingPrice: parseFloat(firstShoe.buying_price),
      },
    ]);
  };

  const updateLine = (key: string, patch: Partial<Line>) => {
    setLines((prev) =>
      prev.map((l) => (l.key === key ? ({ ...l, ...patch } as Line) : l))
    );
  };

  const removeLine = (key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
  };

  const totalCost = useMemo(() => {
    return lines.reduce((sum, l) => {
      if (l.kind === "simple") return sum + l.quantity * l.buyingPrice;
      return sum + l.packs * l.templateTotalPairs * l.buyingPrice;
    }, 0);
  }, [lines]);

  const receiveMut = useMutation({
    mutationFn: (payload: {
      supplier: number;
      notes: string;
      items: ReceiveLine[];
    }) => receiveStock(payload),
    onSuccess: (purchase) => {
      toast.success(`Purchase #${purchase.id} recorded`);
      qc.invalidateQueries({ queryKey: ["purchases"] });
      qc.invalidateQueries({ queryKey: ["shoes"] });
      qc.invalidateQueries({ queryKey: ["reports-dashboard"] });
      navigate(`/purchases/${purchase.id}`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? "Could not record purchase");
    },
  });

  const submit = () => {
    if (!supplierId) {
      toast.error("Please select a supplier.");
      return;
    }
    if (lines.length === 0) {
      toast.error("Add at least one line.");
      return;
    }
    const items: ReceiveLine[] = lines.map((l) => {
      if (l.kind === "simple") {
        return {
          shoe_variant_id: l.variantId,
          quantity: l.quantity,
          buying_price: l.buyingPrice.toFixed(2),
        };
      }
      return {
        pack_template_id: l.templateId,
        packs: l.packs,
        buying_price: l.buyingPrice.toFixed(2),
      };
    });
    receiveMut.mutate({ supplier: supplierId, notes, items });
  };

  // Resolve labels
  const currentSupplierName =
    suppliers.find((s) => s.id === supplierId)?.name ?? "";

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold">Receive stock</h1>
        <p className="text-muted-foreground text-sm">
          Record stock coming into the shop.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>Supplier</Label>
            <Select
              value={supplierId ? String(supplierId) : ""}
              onValueChange={(v) => setSupplierId(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select supplier">
                  {currentSupplierName || "Select supplier"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Restock of school shoes"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {lines.map((line, idx) => (
          <Card key={line.key} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm truncate">
                  Line {idx + 1} — {line.kind === "simple" ? "Simple" : "Pack"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => removeLine(line.key)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Shoe selector */}
              <div className="space-y-1.5">
                <Label className="text-xs">Shoe</Label>
                <Select
                  value={String(line.shoeId)}
                  onValueChange={(v) => {
                    const newShoeId = Number(v);
                    const shoe = shoeById(newShoeId);
                    if (!shoe) return;
                    if (line.kind === "simple") {
                      updateLine(line.key, {
                        shoeId: newShoeId,
                        variantId: shoe.variants[0]?.id ?? 0,
                        buyingPrice: parseFloat(shoe.buying_price),
                      });
                    } else {
                      updateLine(line.key, {
                        shoeId: newShoeId,
                        templateId: 0,
                        templateName: "",
                        templateTotalPairs: 0,
                        buyingPrice: parseFloat(shoe.buying_price),
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {(() => {
                        const s = shoeById(line.shoeId);
                        return s
                          ? `${s.name} · ${s.company_name}`
                          : "Pick a shoe";
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {shoes.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name} · {s.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {line.kind === "simple" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Size</Label>
                    <Select
                      value={String(line.variantId)}
                      onValueChange={(v) =>
                        updateLine(line.key, { variantId: Number(v) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue>
                          {(() => {
                            const v = shoeById(line.shoeId)?.variants.find(
                              (x) => x.id === line.variantId
                            );
                            return v
                              ? `Size ${v.size} (${v.quantity})`
                              : "Pick size";
                          })()}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {shoeById(line.shoeId)?.variants.map((v) => (
                          <SelectItem key={v.id} value={String(v.id)}>
                            Size {v.size} (now {v.quantity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(e) =>
                        updateLine(line.key, {
                          quantity: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Buying price / pair</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={line.buyingPrice}
                      onChange={(e) =>
                        updateLine(line.key, {
                          buyingPrice: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {line.kind === "pack" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Pack template</Label>
                    <Select
                      value={line.templateId ? String(line.templateId) : ""}
                      onValueChange={(v) => {
                        const t = templatesForShoe(line.shoeId).find(
                          (x) => x.id === Number(v)
                        );
                        if (!t) return;
                        updateLine(line.key, {
                          templateId: t.id,
                          templateName: t.name,
                          templateTotalPairs: t.total_pairs,
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select template">
                          {line.templateId
                            ? templatesForShoe(line.shoeId).find(
                                (t) => t.id === line.templateId
                              )?.name ?? "Select template"
                            : "Select template"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {templatesForShoe(line.shoeId).map((t) => (
                          <SelectItem key={t.id} value={String(t.id)}>
                            {t.name} ({t.total_pairs} pairs)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Packs</Label>
                    <Input
                      type="number"
                      min={1}
                      value={line.packs}
                      onChange={(e) =>
                        updateLine(line.key, { packs: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Buying price / pair</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={line.buyingPrice}
                      onChange={(e) =>
                        updateLine(line.key, {
                          buyingPrice: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-1">
                Subtotal:{" "}
                {formatKsh(
                  line.kind === "simple"
                    ? line.quantity * line.buyingPrice
                    : line.packs * line.templateTotalPairs * line.buyingPrice
                )}
                {line.kind === "pack" && line.templateTotalPairs > 0 && (
                  <> · {line.packs * line.templateTotalPairs} pairs</>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={addSimpleLine}>
          <Plus className="h-4 w-4 mr-2" />
          Add simple line
        </Button>
        <Button variant="outline" onClick={addPackLine}>
          <Plus className="h-4 w-4 mr-2" />
          Add pack line
        </Button>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Total cost</div>
        <div className="text-2xl font-bold">{formatKsh(totalCost)}</div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => navigate("/purchases")}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={receiveMut.isPending}>
          {receiveMut.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" /> Record purchase ·{" "}
              {formatKsh(totalCost)}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}