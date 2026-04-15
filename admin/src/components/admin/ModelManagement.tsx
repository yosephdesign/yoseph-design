import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Search,
  MoreVertical,
  ImageIcon,
  Loader2,
  Box,
  Plus,
  Trash2,
  Save,
  X,
  UploadCloud,
} from "lucide-react";
import { useAdminStore } from "../../store/adminStore";
import { Product } from "../../data/products";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { toast } from "sonner";
import { API_URL } from "../../config";
import { useAdminAuthStore } from "../../store/adminAuthStore";

const MODEL_FORMATS = ["RVT", "FBX", "OBJ", "SKP", "3DS", "DWG"] as const;

const FORMAT_DESC: Record<string, string> = {
  RVT: "Revit — BIM & documentation",
  FBX: "FBX — Animation & game engines",
  OBJ: "OBJ — Universal 3D exchange",
  SKP: "SketchUp — Conceptual modeling",
  "3DS": "3DS Max — Rendering & V-Ray",
  DWG: "AutoCAD — 2D/3D CAD drawings",
};

interface ModelFile {
  format: string;
  url?: string;
}

export const ModelManagement: React.FC = () => {
  const { products, loading, fetchProducts, updateProduct } = useAdminStore();
  const token = useAdminAuthStore((state) => state.token);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [localFiles, setLocalFiles] = useState<ModelFile[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingByIndex, setUploadingByIndex] = useState<
    Record<number, boolean>
  >({});
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openEditor = (product: Product) => {
    setEditingProduct(product);
    setLocalFiles(product.modelFiles ? [...product.modelFiles] : []);
  };

  const closeEditor = () => {
    setEditingProduct(null);
    setLocalFiles([]);
  };

  const addFormat = (format: string) => {
    if (localFiles.some((f) => f.format === format)) return;
    setLocalFiles([...localFiles, { format, url: "" }]);
  };

  const removeFormat = (index: number) => {
    setLocalFiles(localFiles.filter((_, i) => i !== index));
  };

  const updateUrl = (index: number, url: string) => {
    const updated = [...localFiles];
    updated[index] = { ...updated[index], url };
    setLocalFiles(updated);
  };

  const setUploading = (index: number, value: boolean) => {
    setUploadingByIndex((prev) => ({ ...prev, [index]: value }));
  };

  const uploadFileForFormat = async (index: number, file: File) => {
    const target = localFiles[index];
    if (!target) return;

    const format = target.format.toUpperCase();
    setUploading(index, true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${API_URL}/api/upload-model-file/${encodeURIComponent(format)}`,
        {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        },
      );

      if (res.status === 401) {
        toast.error("Session expired. Please login again.");
        return;
      }

      const body = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };

      if (!res.ok || !body.url) {
        throw new Error(body.error || "Upload failed");
      }

      updateUrl(index, body.url);
      toast.success(`Uploaded ${file.name} for ${format}`);
    } catch (error: any) {
      console.error("Model file upload failed:", error);
      toast.error(error?.message || "Failed to upload model file");
    } finally {
      setUploading(index, false);
      setDragOverIndex((current) => (current === index ? null : current));
    }
  };

  const onDropFile = async (
    e: React.DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await uploadFileForFormat(index, file);
  };

  const onPickFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    await uploadFileForFormat(index, file);
  };

  const handleSave = async () => {
    if (!editingProduct) return;
    setSaving(true);
    try {
      await updateProduct({
        ...editingProduct,
        modelFiles: localFiles.length > 0 ? localFiles : undefined,
      });
      toast.success(`3D files updated for "${editingProduct.name}"`);
      closeEditor();
    } catch {
      toast.error("Failed to save. Is the server running?");
    } finally {
      setSaving(false);
    }
  };

  const handleClearAll = async (product: Product) => {
    if (!window.confirm(`Remove all 3D files from "${product.name}"?`)) return;
    try {
      await updateProduct({ ...product, modelFiles: undefined });
      toast.success("3D files removed");
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">
            Attach 3D model files to your products. Only products with files
            will show the download option to customers.
          </p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50 hover:bg-neutral-50 border-b border-neutral-100">
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>3D Formats</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-neutral-500"
                  >
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((product) => {
                  const files = product.modelFiles ?? [];
                  const hasFiles = files.length > 0;
                  return (
                    <TableRow
                      key={product.id}
                      className="hover:bg-neutral-50/50 border-b border-neutral-100"
                    >
                      <TableCell>
                        <div className="w-12 h-12 rounded-lg bg-neutral-100 overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-400">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-neutral-400">
                          Br {product.price.toLocaleString()}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {hasFiles ? (
                          <div className="flex flex-wrap gap-1">
                            {files.map((f) => (
                              <Badge
                                key={f.format}
                                className="bg-amber-100 text-amber-800 border-0 text-[10px] font-mono"
                              >
                                .{f.format.toLowerCase()}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-400 italic">
                            No 3D files
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openEditor(product)}
                              className="gap-2"
                            >
                              <Box className="w-4 h-4" /> Manage 3D Files
                            </DropdownMenuItem>
                            {hasFiles && (
                              <DropdownMenuItem
                                onClick={() => handleClearAll(product)}
                                className="gap-2 text-red-600"
                              >
                                <Trash2 className="w-4 h-4" /> Remove All Files
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Edit 3D Files Dialog */}
      <Dialog
        open={!!editingProduct}
        onOpenChange={(open) => !open && closeEditor()}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Box size={18} className="text-amber-500" />
              Manage 3D Files
            </DialogTitle>
            <DialogDescription>
              {editingProduct?.name} — select formats and optionally add
              download URLs.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current files */}
            {localFiles.length > 0 ? (
              <div className="space-y-2">
                {localFiles.map((file, index) => (
                  <div
                    key={index}
                    className="space-y-2 p-3 bg-neutral-50 rounded-lg border border-neutral-100"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-700 bg-white px-2.5 py-1.5 rounded border border-neutral-200 shrink-0 font-mono">
                        .{file.format.toLowerCase()}
                      </span>
                      <Input
                        placeholder="Download URL (optional)"
                        value={file.url || ""}
                        onChange={(e) => updateUrl(index, e.target.value)}
                        className="h-8 text-xs flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeFormat(index)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverIndex(index);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        if (dragOverIndex === index) setDragOverIndex(null);
                      }}
                      onDrop={(e) => onDropFile(e, index)}
                      className={`rounded-md border border-dashed px-3 py-2 transition-colors ${
                        dragOverIndex === index
                          ? "border-amber-400 bg-amber-50"
                          : "border-neutral-300 bg-white"
                      }`}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[11px] text-neutral-500">
                          Drag and drop .{file.format.toLowerCase()} file here
                          or choose file.
                        </p>
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-[11px] font-medium text-neutral-700 hover:bg-neutral-100">
                          {uploadingByIndex[index] ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <UploadCloud size={12} />
                          )}
                          {uploadingByIndex[index]
                            ? "Uploading..."
                            : "Choose File"}
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => onPickFile(e, index)}
                            disabled={!!uploadingByIndex[index]}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-neutral-50 rounded-lg border border-dashed border-neutral-200">
                <Box size={24} className="mx-auto text-neutral-300 mb-2" />
                <p className="text-sm text-neutral-500">No 3D files attached</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Click a format below to add it
                </p>
              </div>
            )}

            {/* Add format buttons */}
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                Add format
              </p>
              <div className="flex flex-wrap gap-1.5">
                {MODEL_FORMATS.filter(
                  (f) => !localFiles.some((mf) => mf.format === f),
                ).map((format) => (
                  <button
                    key={format}
                    type="button"
                    onClick={() => addFormat(format)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-dashed border-neutral-300 rounded-lg hover:border-amber-400 hover:bg-amber-50 text-neutral-600 hover:text-amber-700 transition-colors"
                  >
                    <Plus size={12} />.{format.toLowerCase()}
                    <span className="text-[10px] text-neutral-400 hidden sm:inline">
                      — {FORMAT_DESC[format]?.split(" — ")[1]}
                    </span>
                  </button>
                ))}
                {localFiles.length === MODEL_FORMATS.length && (
                  <p className="text-xs text-neutral-400 py-2">
                    All formats added
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeEditor}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
