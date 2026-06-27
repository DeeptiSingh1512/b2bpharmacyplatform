import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { categories } from "@/lib/mock-data";
import type { Product } from "@/types";

interface EditProductDialogProps {
  product: Product | null;
  open: boolean;
  isSaving?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string | number, data: Partial<Product>) => Promise<void>;
}

type FormState = {
  productName: string;
  manufacturer: string;
  description: string;
  category: string;
  batch: string;
  hsnCode: string;
  price: string;
  stock: string;
  mrp: string;
  gst: string;
  mfgDate: string;
  expiryDate: string;
};

const getInitialState = (product: Product | null): FormState => ({
  productName: product?.productName ?? product?.name ?? "",
  manufacturer: product?.manufacturer ?? "",
  description: product?.description ?? "",
  category: product?.category ?? categories[0],
  batch: product?.batch ?? "",
  hsnCode: product?.hsnCode ?? product?.hsn ?? "",
  price: product?.price != null ? String(product.price) : "",
  stock: product?.stock != null ? String(product.stock) : "",
  mrp: product?.mrp != null ? String(product.mrp) : "",
  gst: product?.gst != null ? String(product.gst) : "12",
  mfgDate: product?.mfgDate ?? "",
  expiryDate: product?.expiryDate ?? "",
});

export function EditProductDialog({
  product,
  open,
  onOpenChange,
  onSave,
  isSaving = false,
}: EditProductDialogProps) {
  const [form, setForm] = React.useState<FormState>(getInitialState(product));
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (product) {
      setForm(getInitialState(product));
      setError(null);
    }
  }, [product]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product) {
      return;
    }

    try {
      setError(null);
      const payload: Partial<Product> = {
        productName: form.productName,
        manufacturer: form.manufacturer,
        description: form.description,
        category: form.category,
        batch: form.batch,
        hsnCode: form.hsnCode,
        price: form.price ? Number(form.price) : undefined,
        stock: form.stock ? Number(form.stock) : undefined,
        mrp: form.mrp ? Number(form.mrp) : undefined,
        gst: form.gst ? Number(form.gst) : undefined,
        mfgDate: form.mfgDate || undefined,
        expiryDate: form.expiryDate || undefined,
      };

      await onSave(product.id, payload);
      onOpenChange(false);
    } catch (err: unknown) {
      const errorMessage =
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as { message: unknown }).message === "string"
          ? (err as { message: string }).message
          : "Unable to save changes. Please try again.";

      setError(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit product</DialogTitle>
          <DialogDescription>
            Update product details, inventory, and pricing for this SKU.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="productName">Product name</Label>
              <Input
                id="productName"
                value={form.productName}
                onChange={(event) => handleChange("productName", event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                value={form.manufacturer}
                onChange={(event) => handleChange("manufacturer", event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) => handleChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hsnCode">HSN code</Label>
              <Input
                id="hsnCode"
                value={form.hsnCode}
                onChange={(event) => handleChange("hsnCode", event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="batch">Batch</Label>
              <Input
                id="batch"
                value={form.batch}
                onChange={(event) => handleChange("batch", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mfgDate">Mfg date</Label>
              <Input
                id="mfgDate"
                type="date"
                value={form.mfgDate}
                onChange={(event) => handleChange("mfgDate", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={form.expiryDate}
                onChange={(event) => handleChange("expiryDate", event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">Wholesale price (₹)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(event) => handleChange("price", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mrp">MRP (₹)</Label>
              <Input
                id="mrp"
                type="number"
                step="0.01"
                min="0"
                value={form.mrp}
                onChange={(event) => handleChange("mrp", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(event) => handleChange("stock", event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gst">GST %</Label>
              <Input
                id="gst"
                type="number"
                min="0"
                value={form.gst}
                onChange={(event) => handleChange("gst", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(event) => handleChange("description", event.target.value)}
                rows={3}
              />
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
