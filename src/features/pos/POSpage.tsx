import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  ShoppingCart,
  Trash2,
  Check,
  Loader2,
  Plus,
  Minus,
} from "lucide-react";
import { toast } from "sonner";

import { listShoes, type Shoe, type ShoeVariant } from "../../api/shoes";
import {
  checkout,
  type CheckoutPayload,
  type PaymentMethod,
  type Sale,
} from "../../api/sales";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";
import { formatKsh } from "../../lib/format";
import { cn } from "../../lib/utils";
import { useMediaQuery } from "../../hooks/useMediaQuery";

type CartLine = {
  variantId: number;
  shoeId: number;
  shoeName: string;
  companyName: string;
  size: number;
  quantity: number;
  unitPrice: number;
  availableStock: number;
};

export default function POSPage() {
  const qc = useQueryClient();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [successSale, setSuccessSale] = useState<Sale | null>(null);

  const [sizesSheetShoe, setSizesSheetShoe] = useState<Shoe | null>(null);
  const [cartSheetOpen, setCartSheetOpen] = useState(false);

  const { data: shoes = [], isLoading } = useQuery({
    queryKey: ["shoes"],
    queryFn: listShoes,
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return shoes;
    return shoes.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.model_number?.toLowerCase().includes(term) ||
        s.company_name.toLowerCase().includes(term)
    );
  }, [shoes, search]);

  const cartTotal = cart.reduce(
    (sum, line) => sum + line.quantity * line.unitPrice,
    0
  );
  const cartItemCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  const addToCart = (shoe: Shoe, variant: ShoeVariant) => {
    if (variant.quantity <= 0) return;
    setCart((prev) => {
      const existing = prev.find((l) => l.variantId === variant.id);
      if (existing) {
        if (existing.quantity >= variant.quantity) {
          toast.warning(
            `Only ${variant.quantity} available for size ${variant.size}`
          );
          return prev;
        }
        return prev.map((l) =>
          l.variantId === variant.id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [
        ...prev,
        {
          variantId: variant.id,
          shoeId: shoe.id,
          shoeName: shoe.name,
          companyName: shoe.company_name,
          size: variant.size,
          quantity: 1,
          unitPrice: parseFloat(variant.effective_price),
          availableStock: variant.quantity,
        },
      ];
    });
  };

  const updateLine = (variantId: number, patch: Partial<CartLine>) => {
    setCart((prev) =>
      prev.map((l) => (l.variantId === variantId ? { ...l, ...patch } : l))
    );
  };

  const removeLine = (variantId: number) => {
    setCart((prev) => prev.filter((l) => l.variantId !== variantId));
  };

  const increaseQuantity = (line: CartLine) => {
    if (line.quantity >= line.availableStock) {
      toast.warning(
        `Only ${line.availableStock} available for size ${line.size}`
      );
      return;
    }
    updateLine(line.variantId, { quantity: line.quantity + 1 });
  };

  const decreaseQuantity = (line: CartLine) => {
    if (line.quantity <= 1) return;
    updateLine(line.variantId, { quantity: line.quantity - 1 });
  };

  const checkoutMut = useMutation({
    mutationFn: (payload: CheckoutPayload) => checkout(payload),
    onSuccess: (sale) => {
      setSuccessSale(sale);
      setCart([]);
      setCartSheetOpen(false);
      qc.invalidateQueries({ queryKey: ["shoes"] });
      qc.invalidateQueries({ queryKey: ["sales"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? "Could not complete sale");
    },
  });

  const completeSale = () => {
    if (cart.length === 0) {
      toast.warning("Cart is empty");
      return;
    }
    checkoutMut.mutate({
      payment_method: paymentMethod,
      items: cart.map((l) => ({
        shoe_variant_id: l.variantId,
        quantity: l.quantity,
        unit_price: l.unitPrice.toFixed(2),
      })),
    });
  };

  const searchBar = (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        className="pl-9"
        placeholder="Search shoe name, model, or brand…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus={isDesktop}
      />
    </div>
  );

  const shoeCardDesktop = (shoe: Shoe) => (
    <div key={shoe.id} className="border rounded-lg p-3 bg-card">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-medium">{shoe.name}</div>
          <div className="text-xs text-muted-foreground">
            {shoe.company_name}
            {shoe.model_number ? ` · ${shoe.model_number}` : ""}
          </div>
        </div>
        <Badge variant="secondary">{formatKsh(shoe.selling_price)}</Badge>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {shoe.variants.length === 0 && (
          <span className="text-xs text-muted-foreground">No sizes</span>
        )}
        {shoe.variants.map((v) => {
          const out = v.quantity <= 0;
          return (
            <button
              key={v.id}
              type="button"
              disabled={out}
              onClick={() => addToCart(shoe, v)}
              className={cn(
                "px-2 py-1 rounded text-xs border transition-colors",
                out
                  ? "bg-muted text-muted-foreground border-muted cursor-not-allowed opacity-50"
                  : "bg-background hover:bg-primary hover:text-primary-foreground border-border cursor-pointer"
              )}
            >
              {v.size}
              <span className="ml-1 text-[10px] opacity-70">
                ({v.quantity})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const shoeCardMobile = (shoe: Shoe) => {
    const totalStock = shoe.variants.reduce((s, v) => s + v.quantity, 0);
    return (
      <button
        key={shoe.id}
        type="button"
        onClick={() => setSizesSheetShoe(shoe)}
        className="w-full text-left border rounded-lg p-3 bg-card active:bg-muted/60 transition-colors"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate">{shoe.name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {shoe.company_name}
              {shoe.model_number ? ` · ${shoe.model_number}` : ""}
            </div>
          </div>
          <Badge variant={totalStock > 0 ? "secondary" : "destructive"}>
            {totalStock}
          </Badge>
        </div>
        <div className="mt-2 text-sm font-medium">
          {formatKsh(shoe.selling_price)}
        </div>
      </button>
    );
  };

  const cartLines = (
    <div className="space-y-3">
      {cart.length === 0 && (
        <p className="text-muted-foreground text-sm text-center pt-8">
          Cart is empty.
        </p>
      )}
      {cart.map((line) => (
        <div
          key={line.variantId}
          className="border rounded-lg p-3 bg-background space-y-2"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm leading-tight truncate">
                {line.shoeName}
              </div>
              <div className="text-xs text-muted-foreground">
                {line.companyName} · Size {line.size}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => removeLine(line.variantId)}
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded shrink-0">
              <button
                type="button"
                className="px-2 py-1 hover:bg-muted disabled:opacity-50"
                onClick={() => decreaseQuantity(line)}
                disabled={line.quantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="px-2 py-1 text-sm min-w-[2rem] text-center">
                {line.quantity}
              </span>
              <button
                type="button"
                className="px-2 py-1 hover:bg-muted disabled:opacity-50"
                onClick={() => increaseQuantity(line)}
                disabled={line.quantity >= line.availableStock}
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            <div className="flex-1 flex items-center gap-1 min-w-0">
              <span className="text-xs text-muted-foreground">@</span>
              <Input
                type="number"
                step="0.01"
                value={line.unitPrice}
                onChange={(e) =>
                  updateLine(line.variantId, {
                    unitPrice: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-8 text-sm"
              />
            </div>

            <div className="text-sm font-medium shrink-0 text-right">
              {formatKsh(line.quantity * line.unitPrice)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const checkoutFooter = (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="text-2xl font-bold">{formatKsh(cartTotal)}</span>
      </div>

      <div>
        <div className="text-xs text-muted-foreground mb-1.5">
          Payment method
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={paymentMethod === "CASH" ? "default" : "outline"}
            onClick={() => setPaymentMethod("CASH")}
            className="w-full"
          >
            Cash
          </Button>
          <Button
            type="button"
            variant={paymentMethod === "MPESA" ? "default" : "outline"}
            onClick={() => setPaymentMethod("MPESA")}
            className="w-full"
          >
            M-Pesa
          </Button>
        </div>
      </div>

      <Button
        className="w-full h-12 text-base"
        size="lg"
        onClick={completeSale}
        disabled={cart.length === 0 || checkoutMut.isPending}
      >
        {checkoutMut.isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <Check className="h-4 w-4 mr-2" />
            Complete · {formatKsh(cartTotal)}
          </>
        )}
      </Button>
    </div>
  );

  return (
    <>
      {/* ---------- MOBILE ---------- */}
      {!isDesktop && (
        <div className="flex flex-col h-[calc(100dvh-3.5rem)]">
          <div className="p-3 border-b bg-background">{searchBar}</div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 pb-24">
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            )}
            {!isLoading && filtered.length === 0 && (
              <p className="text-muted-foreground text-sm text-center pt-8">
                {search ? "No shoes match." : "No shoes yet."}
              </p>
            )}
            {filtered.map(shoeCardMobile)}
          </div>

          {cart.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 p-3 bg-background border-t shadow-lg">
              <Button
                className="w-full h-12 text-base"
                onClick={() => setCartSheetOpen(true)}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart ({cartItemCount}) · {formatKsh(cartTotal)}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ---------- DESKTOP ---------- */}
      {isDesktop && (
        <div className="h-[calc(100vh-2rem)] flex">
          <div className="flex-1 flex flex-col border-r bg-background min-w-0">
            <div className="p-4 border-b">{searchBar}</div>
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </div>
              )}
              {!isLoading && filtered.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  {search ? "No shoes match." : "No shoes yet."}
                </p>
              )}
              <div className="grid gap-3">
                {filtered.map(shoeCardDesktop)}
              </div>
            </div>
          </div>

          <div className="w-[420px] flex flex-col bg-muted/30">
            <div className="p-4 border-b bg-background">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Cart</h2>
                <Badge variant="secondary" className="ml-auto">
                  {cartItemCount} item{cartItemCount === 1 ? "" : "s"}
                </Badge>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{cartLines}</div>
            <Separator />
            <div className="p-4 bg-background">{checkoutFooter}</div>
          </div>
        </div>
      )}

      {/* Sizes sheet — mobile only */}
      <Sheet
        open={!!sizesSheetShoe}
        onOpenChange={(o) => !o && setSizesSheetShoe(null)}
      >
        <SheetContent side="bottom" className="max-h-[85vh]">
          <SheetHeader>
            <SheetTitle>{sizesSheetShoe?.name}</SheetTitle>
          </SheetHeader>
          {sizesSheetShoe && (
            <div className="mt-4 space-y-3 pb-4">
              <div className="text-sm text-muted-foreground">
                {sizesSheetShoe.company_name} ·{" "}
                {formatKsh(sizesSheetShoe.selling_price)}
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2">
                {sizesSheetShoe.variants.length === 0 && (
                  <div className="col-span-3 text-sm text-muted-foreground">
                    No sizes available.
                  </div>
                )}
                {sizesSheetShoe.variants.map((v) => {
                  const out = v.quantity <= 0;
                  return (
                    <Button
                      key={v.id}
                      type="button"
                      variant={out ? "outline" : "default"}
                      disabled={out}
                     onClick={() => {
                            addToCart(sizesSheetShoe, v);
                            toast.success(`Added size ${v.size}`, { duration: 1500 });
                          }}
                      className="h-16 flex-col gap-0.5"
                    >
                      <span className="text-base font-semibold">{v.size}</span>
                      <span className="text-[10px] opacity-80">
                        {v.quantity} in stock
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Cart sheet — mobile only */}
      <Sheet open={cartSheetOpen} onOpenChange={setCartSheetOpen}>
        <SheetContent side="bottom" className="h-[90vh] flex flex-col">
          <SheetHeader>
            <SheetTitle>Cart · {cartItemCount} item{cartItemCount === 1 ? "" : "s"}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto py-4">{cartLines}</div>
          <div className="border-t pt-4 pb-2">{checkoutFooter}</div>
        </SheetContent>
      </Sheet>

      {/* Success */}
      <Dialog
        open={!!successSale}
        onOpenChange={(open) => !open && setSuccessSale(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              Sale completed
            </DialogTitle>
          </DialogHeader>
          {successSale && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Sale #{successSale.id}
              </div>
              <div className="text-3xl font-bold">
                {formatKsh(successSale.total_amount)}
              </div>
              <div className="text-sm">
                Payment:{" "}
                <Badge variant="outline">{successSale.payment_method}</Badge>
              </div>
              <div className="border rounded divide-y text-sm max-h-64 overflow-y-auto">
                {successSale.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 gap-2"
                  >
                    <span className="truncate">
                      {item.shoe_name} · Sz {item.size} × {item.quantity}
                    </span>
                    <span className="shrink-0">
                      {formatKsh(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSuccessSale(null)} className="w-full">
              New sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}