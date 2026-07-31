"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createVendor, updateVendor, type VendorFormState } from "./actions";

type Vendor = {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
};

const initialState: VendorFormState = { error: null };

export function VendorDialog({ vendor }: { vendor?: Vendor }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<VendorFormState>(initialState);
  const [isPending, startTransition] = useTransition();
  const isEdit = !!vendor;
  const action = isEdit ? updateVendor.bind(null, vendor.id) : createVendor;

  function formAction(formData: FormData) {
    startTransition(async () => {
      const result = await action(state, formData);
      setState(result);
      if (result.error === null) {
        toast.success(isEdit ? "Vendor diperbarui." : "Vendor ditambahkan.");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" aria-label="Edit vendor">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" />
            Tambah Vendor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Vendor" : "Tambah Vendor"}</DialogTitle>
            <DialogDescription>
              Master data pihak ketiga / rekanan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Vendor</Label>
              <Input id="name" name="name" defaultValue={vendor?.name} required />
              {state.fieldErrors?.name && (
                <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName">Nama Kontak</Label>
              <Input
                id="contactName"
                name="contactName"
                defaultValue={vendor?.contactName ?? ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={vendor?.email ?? ""}
                />
                {state.fieldErrors?.email && (
                  <p className="text-sm text-destructive">{state.fieldErrors.email[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telepon</Label>
                <Input id="phone" name="phone" defaultValue={vendor?.phone ?? ""} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Input id="address" name="address" defaultValue={vendor?.address ?? ""} />
            </div>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
