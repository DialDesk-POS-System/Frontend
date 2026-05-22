import { AppLayout } from "@/components/layout/AppLayout";
import { Topbar } from "@/components/layout/Topbar";
import { sampleBatches, brands } from "@/data/mock";
import { createImport, deleteImport, updateImport, useImports } from "@/hooks/use-imports";
import { useWatches } from "@/hooks/use-watches";
import {
  Plus,
  Package,
  Calendar,
  Truck,
  FileText,
  CheckCircle2,
  Search,
  Trash2,
  Edit2,
  X,
} from "lucide-react";
import { useState, useMemo } from "react";
import {
  watchColors,
  strapMaterials,
  watchModels,
} from "@/constants/watch-options";

const Batches = () => {
  const { imports, loading, error, setImports } = useImports();
  const [showNew, setShowNew] = useState(false);
  const { watches } = useWatches();
  const [group, setGroup] = useState([
    {
      modelId: "",
      importId: "",
      serialNo: "",
      color: "",
      quantity: "",
      waterResistanceM: "",
      costPrice: "",
      sellingPrice: "",
      strapMaterial: "",
      imageryUrl: "",
    },
  ]);

  const afterClose = () =>{
    setShowNew((s)=> !s)
    setGroup([
    {
      modelId: "",
      importId: "",
      serialNo: "",
      color: "",
      quantity: "",
      waterResistanceM: "",
      costPrice: "",
      sellingPrice: "",
      strapMaterial: "",
      imageryUrl: "",
    },
  ])
  }

  const [newBatchForm, setNewBatchForm] = useState({
    supplier: "",
    totalItems: "",
    importDate: "",
  });

  const handleAddGroup = () => {
    setGroup([
      ...group,
      {
        modelId: "",
        importId: "",
        serialNo: "",
        color: "",
        quantity: "",
        waterResistanceM: "",
        costPrice: "",
        sellingPrice: "",
        strapMaterial: "",
        imageryUrl: "",
      },
    ]);
  };

  const handleRemoveGroup = (index: number) => {
    setGroup(group.filter((_, i) => i !== index));
  };

  const handleGroupChange = (index: number, field: string, value: string) => {
    const updatedGroup = [...group];
    updatedGroup[index] = { ...updatedGroup[index], [field]: value };
    setGroup(updatedGroup);
  };

  // Search and filter states
  const [searchId, setSearchId] = useState("");
  const [searchSupplier, setSearchSupplier] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Edit modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    supplier: "",
    importDate: "",
    totalItems: "",
  });

  // Filter imports based on search criteria
  const filteredImports = useMemo(() => {
    return imports.filter((batch) => {
      const idMatch = searchId === "" || batch.id.toString().includes(searchId);
      const supplierMatch =
        searchSupplier === "" ||
        batch.supplier.toLowerCase().includes(searchSupplier.toLowerCase());
      const dateMatch =
        (startDate === "" ||
          new Date(batch.importDate) >= new Date(startDate)) &&
        (endDate === "" || new Date(batch.importDate) <= new Date(endDate));

      return idMatch && supplierMatch && dateMatch;
    });
  }, [imports, searchId, searchSupplier, startDate, endDate]);

  const handleDeleteBatch = async (batchId: number) => {
    if (confirm("Are you sure you want to delete this batch?")) {
      await deleteImport(batchId);

      setImports((prev) => prev.filter((i) => i.id !== batchId));
    }
  };

  const handleCreateBatch = async( e: React.FormEvent) =>{

     e.preventDefault();

     const dto = {
       supplier:
         newBatchForm.supplier,

      totalItems:
         Number(
            newBatchForm.totalItems
         ),

      importDate:
         new Date(
            newBatchForm.importDate
         ).toISOString(),

      watches: group.map((g) => ({
      modelId: Number(g.modelId),
      quantity: Number(g.quantity),
      costPrice: Number(g.costPrice),
      sellingPrice: Number(g.sellingPrice),
      waterResistanceM: Number(g.waterResistanceM),

      serialNo: g.serialNo || null,
      color: g.color || null,
      strapMaterial: g.strapMaterial || null,
      imageryUrl: g.imageryUrl || null,
    }))


     }
 
     try {
      await createImport(dto);

      console.log("Success");




      
     } catch (error) {
      console.log(error)
     }
  }

  const handleUpdateBatch = (batchId: number) => {
    const batch = imports.find((b) => b.id === batchId);
    console.log(batch.importDate);
    if (batch) {
      setEditingBatchId(batchId);
      setEditForm({
        supplier: batch.supplier,
        importDate: batch.importDate,
        totalItems: batch.totalItems.toString(),
      });
      setIsEditOpen(true);
    }
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditingBatchId(null);
    setEditForm({
      supplier: "",
      importDate: "",
      totalItems: "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingBatchId) return;
    console.log(editForm.importDate);
    const dto = {
      supplier: editForm.supplier,
      importDate: new Date(editForm.importDate).toISOString(),
      totalItems: parseInt(editForm.totalItems),
    };

    await updateImport(editingBatchId, dto);

    // Update the imports list with new values

    setImports((prev) =>
      prev.map((batch) =>
        batch.id === editingBatchId
          ? {
              ...batch,

              supplier: editForm.supplier,

              importDate: editForm.importDate,

              totalItems: parseInt(editForm.totalItems) || batch.totalItems,
            }
          : batch,
      ),
    );

    closeEditModal();
  };
  return (
    <AppLayout>
      <Topbar
        title="Batch imports"
        subtitle="Group new stock arrivals into traceable batches"
      />

      <div className="flex justify-end mb-4">
        <button
          onClick={() => afterClose()}
          className="gradient-primary text-primary-foreground rounded-2xl h-11 px-5 text-sm font-semibold flex items-center gap-2 shadow-glow hover:scale-105 transition-transform"
        >
          <Plus className="h-4 w-4" /> Start new batch
        </button>
      </div>

      {showNew && (
        <div className="glass rounded-3xl p-6 mb-5 animate-fade-in">
          <h3 className="font-display text-lg font-bold mb-4">
            New batch import
          </h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            // Validate required fields
            if (!newBatchForm.supplier || !newBatchForm.totalItems || !newBatchForm.importDate) {
              alert("Please fill all required fields");
              return;
            }
            handleCreateBatch(e)

            console.log("New batch:", { ...newBatchForm, groups: group });
          }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">
                  Supplier <span className="text-destructive">*</span>
                </span>
                <div className="glass-soft rounded-2xl flex items-center gap-2 px-4 h-11 mt-1.5">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <input
                    required
                    type="text"
                    value={newBatchForm.supplier}
                    onChange={(e) => setNewBatchForm(prev => ({ ...prev, supplier: e.target.value }))}
                    placeholder="Tokyo Time Co."
                    className="bg-transparent outline-none text-sm flex-1"
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">
                  Total Items <span className="text-destructive">*</span>
                </span>
                <div className="glass-soft rounded-2xl flex items-center gap-2 px-4 h-11 mt-1.5">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <input
                    required
                    type="number"
                    value={newBatchForm.totalItems}
                    onChange={(e) => setNewBatchForm(prev => ({ ...prev, totalItems: e.target.value }))}
                    placeholder="Number of items to add"
                    className="bg-transparent outline-none text-sm flex-1"
                    min="1"
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">
                  Import Date <span className="text-destructive">*</span>
                </span>
                <div className="glass-soft rounded-2xl flex items-center gap-2 px-4 h-11 mt-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <input
                    required
                    type="date"
                    value={newBatchForm.importDate}
                    onChange={(e) => setNewBatchForm(prev => ({ ...prev, importDate: e.target.value }))}
                    className="bg-transparent outline-none text-sm flex-1"
                  />
                </div>
              </label>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">Watch groups</h4>
                <button 
                  type="button"
                  onClick={handleAddGroup}
                  className="text-xs font-semibold text-primary flex items-center gap-1 hover:text-primary-bright transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Add group
                </button>
              </div>

              {/* Render each group */}
              {group.map((g, index) => (
                <div key={index} className="glass-soft rounded-2xl p-4 mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-xs font-semibold text-muted-foreground">
                      Group {index + 1}
                    </h5>
                    {group.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveGroup(index)}
                        className="text-xs font-semibold text-destructive hover:text-destructive-bright transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                    <label className="block">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Model <span className="text-destructive">*</span>
                      </span>
                      <select 
                        required
                        value={g.modelId}
                        onChange={(e) => handleGroupChange(index, "modelId", e.target.value)}
                        className="w-full rounded-xl bg-background border border-border h-11 px-3 text-sm mt-1.5"
                      >
                        <option value="">Choose model...</option>
                        {watchModels.map((watch) => (
                          <option key={watch.id} value={watch.id}>
                            {watch.name} - {watch.id} 
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Quantity <span className="text-destructive">*</span>
                      </span>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="0"
                        value={g.quantity}
                        onChange={(e) => handleGroupChange(index, "quantity", e.target.value)}
                        className="w-full rounded-xl bg-background border border-border h-11 px-3 text-sm mt-1.5"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Cost Price $ <span className="text-destructive">*</span>
                      </span>
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={g.costPrice}
                        onChange={(e) => handleGroupChange(index, "costPrice", e.target.value)}
                        className="w-full rounded-xl bg-background border border-border h-11 px-3 text-sm mt-1.5"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Selling Price $ <span className="text-destructive">*</span>
                      </span>
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={g.sellingPrice}
                        onChange={(e) => handleGroupChange(index, "sellingPrice", e.target.value)}
                        className="w-full rounded-xl bg-background border border-border h-11 px-3 text-sm mt-1.5"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Color
                      </span>
                      <select 
                        value={g.color}
                        onChange={(e) => handleGroupChange(index, "color", e.target.value)}
                        className="w-full rounded-xl bg-background border border-border h-11 px-3 text-sm mt-1.5"
                      >
                        <option value="">Choose color...</option>
                        {watchColors.map((color) => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Serial Number
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. SN123456"
                        value={g.serialNo}
                        onChange={(e) => handleGroupChange(index, "serialNo", e.target.value)}
                        className="w-full rounded-xl bg-background border border-border h-11 px-3 text-sm mt-1.5"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Water Resistant
                      </span>
                      <input
                        type="number"
                        placeholder="e.g. SN123456"
                        value={g.waterResistanceM}
                        onChange={(e) => handleGroupChange(index, "waterResistanceM", e.target.value)}
                        className="w-full rounded-xl bg-background border border-border h-11 px-3 text-sm mt-1.5"
                      />
                      {/* <select 
                      
                        value={g.waterResistanceM}
                        onChange={(e) => handleGroupChange(index, "waterResistanceM", e.target.value)}
                        className="w-full rounded-xl bg-background border border-border h-11 px-3 text-sm mt-1.5"
                      >
                        <option value="">Select...</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select> */}
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Strap Material
                      </span>
                      <select 
                        value={g.strapMaterial}
                        onChange={(e) => handleGroupChange(index, "strapMaterial", e.target.value)}
                        className="w-full rounded-xl bg-background border border-border h-11 px-3 text-sm mt-1.5"
                      >
                        <option value="">Choose material...</option>
                        {strapMaterials.map((material) => (
                          <option key={material} value={material}>
                            {material}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block md:col-span-2">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Imagery URL
                      </span>
                      <input
                        type="text"
                        placeholder="https://example.com/image.jpg"
                        value={g.imageryUrl}
                        onChange={(e) => handleGroupChange(index, "imageryUrl", e.target.value)}
                        className="w-full rounded-xl bg-background border border-border h-11 px-3 text-sm mt-1.5"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setShowNew(false)}
                className="rounded-2xl h-11 px-5 text-sm font-semibold text-muted-foreground hover:bg-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="gradient-primary text-primary-foreground rounded-2xl h-11 px-5 text-sm font-semibold flex items-center gap-2 shadow-glow">
                <CheckCircle2 className="h-4 w-4" /> Confirm batch
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass rounded-3xl p-5">
        <h3 className="font-display text-lg font-bold mb-4">Past batches</h3>

        {/* ************** */}

        {/* Search and Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
          <div className="glass-soft rounded-2xl flex items-center gap-2 px-4 h-11">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search by ID…"
              className="bg-transparent outline-none text-sm flex-1"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>

          <div className="glass-soft rounded-2xl flex items-center gap-2 px-4 h-11">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search by Supplier…"
              className="bg-transparent outline-none text-sm flex-1"
              value={searchSupplier}
              onChange={(e) => setSearchSupplier(e.target.value)}
            />
          </div>

          <div className="glass-soft rounded-2xl flex items-center gap-2 px-4 h-11">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              className="bg-transparent outline-none text-sm flex-1"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="glass-soft rounded-2xl flex items-center gap-2 px-4 h-11">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              className="bg-transparent outline-none text-sm flex-1"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Batches Grid */}
        {/* ************************** */}
        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredImports.map((b) => (
            <div
              key={b.id}
              className="glass-soft rounded-2xl p-5 hover:shadow-glow transition-all duration-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display font-bold text-lg">
                    BatchID - {b.id}
                  </p>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-primary-soft text-primary grid place-items-center">
                  <Package className="h-5 w-5" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
                <div>
                  <p className="text-[11px] text-muted-foreground">Supplier</p>
                  <p className="font-semibold">{b.supplier}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Date</p>
                  <p className="font-semibold">
                    {b.importDate.split("T")[0]} -
                    {new Date(b.importDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Units</p>
                  <p className="font-semibold">{b.totalItems}</p>
                </div>
              </div>
              {/* ************************* */}
              <div className="flex items-center justify-end gap-2 mt-4">
                <button
                  onClick={() => handleUpdateBatch(b.id)}
                  className="h-9 w-9 rounded-xl glass-soft text-primary hover:shadow-glow transition-all grid place-items-center"
                  title="Edit batch"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteBatch(b.id)}
                  className="h-9 w-9 rounded-xl glass-soft text-destructive hover:shadow-glow transition-all grid place-items-center"
                  title="Delete batch"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {/* ***************************** */}
            </div>
          ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <div
          className="fixed inset-0 z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Edit batch"
        >
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onMouseDown={closeEditModal}
          />

          <div className="relative mx-auto flex min-h-full items-center justify-center">
            <div className="relative w-full max-w-lg glass rounded-3xl shadow-glow border border-border/60">
              <div className="p-5 flex items-start justify-between gap-4 border-b border-border/50">
                <div>
                  <h3 className="font-display text-lg font-bold">Edit Batch</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Update batch details
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="h-10 w-10 rounded-2xl glass-soft grid place-items-center hover:shadow-glow"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <label className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Supplier
                  </span>
                  <div className="glass-soft rounded-2xl flex items-center gap-2 px-4 h-11">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={editForm.supplier}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          supplier: e.target.value,
                        }))
                      }
                      className="bg-transparent outline-none text-sm flex-1"
                      placeholder="Supplier name"
                    />
                  </div>
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Import Date
                  </span>
                  <div className="glass-soft rounded-2xl flex items-center gap-2 px-4 h-11">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={editForm.importDate}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          importDate: e.target.value,
                        }))
                      }
                      className="bg-transparent outline-none text-sm flex-1"
                    />
                  </div>
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Total Items
                  </span>
                  <div className="glass-soft rounded-2xl flex items-center gap-2 px-4 h-11">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="number"
                      value={editForm.totalItems}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          totalItems: e.target.value,
                        }))
                      }
                      className="bg-transparent outline-none text-sm flex-1"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </label>

                <div className="flex items-center justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="h-11 px-5 rounded-2xl glass-soft text-sm font-semibold hover:shadow-glow"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="h-11 px-5 rounded-2xl gradient-primary text-primary-foreground text-sm font-semibold shadow-glow"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Batches;
