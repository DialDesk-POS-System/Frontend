import { AppLayout } from "@/components/layout/AppLayout";
import { Topbar } from "@/components/layout/Topbar";
import { Search, RotateCcw, RefreshCw, Wallet, X } from "lucide-react";
import { useReturn } from "@/hooks/use-return";
import { useMemo, useState } from "react";
import { api } from "@/services/api";

const Returns = () => {
  const { returns, loading, error , setReturns  } = useReturn();

  const [isNewReturnOpen, setIsNewReturnOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    originalSaleItemId: "",
    newSaleItemId: "",
    refundAmount: "",
    returnDate: "",
  });

  const todayForDateInput = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const openNewReturn = () => {
    setFormError(null);
    setForm({
      originalSaleItemId: "",
      newSaleItemId: "",
      refundAmount: "",
      returnDate: todayForDateInput,
    });
    setIsNewReturnOpen(true);
  };

  const closeNewReturn = () => {
    setIsNewReturnOpen(false);
    setFormError(null);
  };

const onSubmitNewReturn = async (e: React.FormEvent) => {
  e.preventDefault();
  setFormError(null);

  const originalSaleItemId = Number(form.originalSaleItemId);
  const newSaleItemId =
    form.newSaleItemId.trim() === "" ? null : Number(form.newSaleItemId);
  const refundAmount = Number(form.refundAmount);

  if (!Number.isFinite(originalSaleItemId) || originalSaleItemId <= 0) {
    setFormError("Original sale item id is required.");
    return;
  }
  if (
    newSaleItemId !== null &&
    (!Number.isFinite(newSaleItemId) || newSaleItemId <= 0)
  ) {
    setFormError("New sale item id must be a positive number.");
    return;
  }
  if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
    setFormError("Refund amount is required.");
    return;
  }
  if (!form.returnDate) {
    setFormError("Return date is required.");
    return;
  }

  try {
    const dto = {
      originalSaleItemId,
      newSaleItemId,
      returnDate: form.returnDate,
      refundAmount,
    };

    const createdReturn = await api.returns.create(dto);

    // ✅ Add to table instantly without refetching
    setReturns((prev) => [createdReturn, ...prev]);

    // ✅ Close the modal
    closeNewReturn();

  } catch (error: any) {
    // ✅ Show error inside the form
    setFormError(error.message || "Failed to create return");
  }
};

  return (
    <AppLayout>
      <Topbar
        title="Returns & exchanges"
        subtitle="Process refunds, exchanges and store credit"
      />

      <div className="grid grid-cols-1 gap-4">
        {/* Returns table */}
        <div className="glass rounded-3xl p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="glass-soft rounded-2xl flex items-center gap-2 px-4 h-11 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Look up by invoice number…"
                className="bg-transparent outline-none text-sm flex-1"
              />
            </div>
            <button
              type="button"
              onClick={openNewReturn}
              className="gradient-primary text-primary-foreground rounded-2xl h-11 px-5 text-sm font-semibold shadow-glow"
            >
              New return
            </button>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 font-semibold">Return</th>
                  <th className="py-3 font-semibold">Original item</th>
                  <th className="py-3 font-semibold">New item</th>
                  <th className="py-3 font-semibold">Type</th>
                  <th className="py-3 font-semibold">Date</th>
                  <th className="py-3 font-semibold text-right">Refund</th>
                </tr>
              </thead>
              <tbody>
                {/* Loading state */}
                {loading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      Loading returns...
                    </td>
                  </tr>
                )}

                {/* Error state */}
                {error && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-sm text-destructive"
                    >
                      {error}
                    </td>
                  </tr>
                )}

                {/* Empty state */}
                {!loading && !error && returns.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No returns found
                    </td>
                  </tr>
                )}

                {/* Data rows */}
                {!loading &&
                  !error &&
                  returns.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t border-border/60 hover:bg-primary-soft/40 transition-colors"
                    >
                      <td className="py-3 font-semibold">RET-{r.id}</td>
                      <td className="py-3 text-primary font-semibold">
                        #{r.originalSaleItemId}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {r.newSaleItemId ? `#${r.newSaleItemId}` : "—"}
                      </td>
                      <td className="py-3">
                        <span className="bg-secondary px-2.5 py-1 rounded-full text-xs font-medium">
                          {r.newSaleItemId ? "Exchange" : "Refund"}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(r.returnDate).toLocaleString()}

                      </td>
                      <td className="py-3 font-bold text-right">
                        ${r.refundAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick actions */}
        <div className="glass rounded-3xl p-5 space-y-3 w-full max-w-sm sm:max-w-md">
          <h3 className="font-display text-lg font-bold">Quick actions</h3>
          {[
            { icon: RotateCcw, label: "Process return",     desc: "Refund within policy window" },
            { icon: RefreshCw, label: "Start exchange",     desc: "Swap for another model" },
            { icon: Wallet,    label: "Issue store credit", desc: "Generate credit note" },
          ].map((a) => (
            <button
              key={a.label}
              className="w-full glass-soft rounded-2xl p-4 flex items-center gap-3 text-left hover:shadow-glow hover:bg-primary-soft transition-all"
            >
              <div className="h-10 w-10 rounded-xl gradient-primary text-primary-foreground grid place-items-center shadow-glow">
                <a.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">{a.label}</p>
                <p className="text-[11px] text-muted-foreground">{a.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* New return modal */}
      {isNewReturnOpen && (
        <div
          className="fixed inset-0 z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="New return"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onMouseDown={closeNewReturn}
          />

          <div className="relative mx-auto flex min-h-full items-center justify-center">
            <div className="relative w-full max-w-lg glass rounded-3xl shadow-glow border border-border/60">
              {/* Modal header */}
              <div className="p-5 flex items-start justify-between gap-4 border-b border-border/50">
                <div>
                  <h3 className="font-display text-lg font-bold">
                    Create return
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter return details to submit to the system.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeNewReturn}
                  className="h-10 w-10 rounded-2xl glass-soft grid place-items-center hover:shadow-glow"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal form */}
              <form onSubmit={onSubmitNewReturn} className="p-5 space-y-4">
                {formError && (
                  <div className="glass-soft rounded-2xl p-3 text-sm text-destructive border border-destructive/30">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="space-y-1">
                    <span className="text-xs text-muted-foreground">
                      Original sale item id *
                    </span>
                    <input
                      inputMode="numeric"
                      value={form.originalSaleItemId}
                      onChange={(e) =>
                        setForm((v) => ({
                          ...v,
                          originalSaleItemId: e.target.value,
                        }))
                      }
                      className="w-full h-11 px-4 rounded-2xl glass-soft bg-transparent outline-none text-sm"
                      placeholder="e.g. 123"
                      required
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-xs text-muted-foreground">
                      New sale item id (optional)
                    </span>
                    <input
                      inputMode="numeric"
                      value={form.newSaleItemId}
                      onChange={(e) =>
                        setForm((v) => ({
                          ...v,
                          newSaleItemId: e.target.value,
                        }))
                      }
                      className="w-full h-11 px-4 rounded-2xl glass-soft bg-transparent outline-none text-sm"
                      placeholder="e.g. 456"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-xs text-muted-foreground">
                      Refund amount *
                    </span>
                    <input
                      inputMode="decimal"
                      value={form.refundAmount}
                      onChange={(e) =>
                        setForm((v) => ({
                          ...v,
                          refundAmount: e.target.value,
                        }))
                      }
                      className="w-full h-11 px-4 rounded-2xl glass-soft bg-transparent outline-none text-sm"
                      placeholder="e.g. 199.99"
                      required
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-xs text-muted-foreground">
                      Return date *
                    </span>
                    <input
                      type="date"
                      value={form.returnDate}
                      onChange={(e) =>
                        setForm((v) => ({
                          ...v,
                          returnDate: e.target.value,
                        }))
                      }
                      className="w-full h-11 px-4 rounded-2xl glass-soft bg-transparent outline-none text-sm"
                      required
                    />
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeNewReturn}
                    className="h-11 px-5 rounded-2xl glass-soft text-sm font-semibold hover:shadow-glow"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-11 px-5 rounded-2xl gradient-primary text-primary-foreground text-sm font-semibold shadow-glow"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Returns;