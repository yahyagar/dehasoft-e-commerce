"use client";

import type { Category } from "@/types/category";
import type { Product, ProductPayload } from "@/types/product";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type ProductFormState = {
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: string;
  is_active: boolean;
};

type AdminProductFormProps = {
  categories: Category[];
  product: Product | null;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (payload: ProductPayload, productId?: number) => Promise<void>;
};

const emptyForm: ProductFormState = {
  category_id: "",
  name: "",
  slug: "",
  description: "",
  price: "",
  stock: "",
  is_active: true,
};

function toLira(priceTry: number) {
  return (priceTry / 100).toFixed(2);
}

function buildInitialForm(product: Product | null): ProductFormState {
  if (!product) {
    return emptyForm;
  }

  return {
    category_id: product.category?.id.toString() ?? "",
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    price: toLira(product.price_try),
    stock: product.stock.toString(),
    is_active: product.is_active,
  };
}

function SectionTitle({
  title,
  marker,
}: {
  title: string;
  marker: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-blue-900 text-sm font-black text-blue-900">
        {marker}
      </span>
      <h2 className="text-2xl font-black text-slate-950">{title}</h2>
    </div>
  );
}

export function AdminProductForm({
  categories,
  product,
  isSaving,
  onCancel,
  onSubmit,
}: AdminProductFormProps) {
  const [form, setForm] = useState<ProductFormState>(() =>
    buildInitialForm(product)
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
    product?.image_url ?? null
  );
  const objectPreviewUrl = useRef<string | null>(null);

  const isEditing = product !== null;

  useEffect(() => {
    return () => {
      if (objectPreviewUrl.current) {
        URL.revokeObjectURL(objectPreviewUrl.current);
      }
    };
  }, []);

  function updateField(field: keyof ProductFormState, value: string | boolean) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (objectPreviewUrl.current) {
      URL.revokeObjectURL(objectPreviewUrl.current);
      objectPreviewUrl.current = null;
    }

    setImageFile(file);

    if (!file) {
      setImagePreviewUrl(product?.image_url ?? null);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    objectPreviewUrl.current = nextPreviewUrl;
    setImagePreviewUrl(nextPreviewUrl);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = new FormData();
    payload.set("category_id", form.category_id);
    payload.set("name", form.name);

    if (form.slug) {
      payload.set("slug", form.slug);
    }

    if (form.description) {
      payload.set("description", form.description);
    }

    if (imageFile) {
      payload.set("image", imageFile);
    }

    payload.set("price", String(Math.round(Number(form.price) * 100)));
    payload.set("stock", form.stock);
    payload.set("is_active", form.is_active ? "1" : "0");

    await onSubmit(payload, product?.id);
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 lg:p-10">
      <div className="text-sm font-bold text-slate-700">
        Ürünler <span className="mx-2 text-slate-400">›</span>
        <span className="text-blue-950">
          {isEditing ? "Ürünü Güncelle" : "Yeni Ürün Ekle"}
        </span>
      </div>

      <h1 className="mt-4 text-4xl font-black text-slate-950">
        Ürün Bilgileri
      </h1>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_390px]">
        <div className="space-y-8">
          <section className="rounded-md border border-slate-300 bg-white p-8">
            <SectionTitle title="Genel Bilgiler" marker="i" />

            <label className="mt-8 block text-sm font-bold text-slate-700">
              Ürün Adı
              <input
                required
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Örn: Kablosuz Bluetooth Kulaklık"
                className="mt-3 h-14 w-full rounded-md border border-slate-300 px-4 text-lg outline-none transition focus:border-blue-900"
              />
            </label>

            <label className="mt-8 block text-sm font-bold text-slate-700">
              Açıklama
              <textarea
                rows={7}
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Ürün özelliklerini ve detaylarını buraya girin..."
                className="mt-3 w-full resize-none rounded-md border border-slate-300 px-4 py-4 text-lg outline-none transition focus:border-blue-900"
              />
            </label>

            <label className="mt-8 block text-sm font-bold text-slate-700">
              Slug
              <input
                value={form.slug}
                onChange={(event) => updateField("slug", event.target.value)}
                placeholder="urun-url-kisa-adi"
                className="mt-3 h-12 w-full rounded-md border border-slate-300 px-4 outline-none transition focus:border-blue-900"
              />
            </label>
          </section>

          <section className="rounded-md border border-slate-300 bg-white p-8">
            <SectionTitle title="Fiyatlandırma ve Stok" marker="₺" />

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <label className="text-sm font-bold text-slate-700">
                Fiyat
                <div className="mt-3 flex h-14 overflow-hidden rounded-md border border-slate-300 bg-white focus-within:border-blue-900">
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) =>
                      updateField("price", event.target.value)
                    }
                    placeholder="0.00"
                    className="min-w-0 flex-1 px-4 text-lg outline-none"
                  />
                  <span className="grid w-20 place-items-center border-l border-slate-300 font-bold text-slate-700">
                    TRY
                  </span>
                </div>
              </label>

              <label className="text-sm font-bold text-slate-700">
                Stok Adedi
                <input
                  required
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(event) => updateField("stock", event.target.value)}
                  placeholder="0"
                  className="mt-3 h-14 w-full rounded-md border border-slate-300 px-4 text-lg outline-none transition focus:border-blue-900"
                />
              </label>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="rounded-md border border-slate-300 bg-white p-8">
            <SectionTitle title="Ürün Görseli" marker="G" />

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="aspect-[4/3] overflow-hidden rounded-md border-2 border-blue-900 bg-slate-100">
                {imagePreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagePreviewUrl}
                    alt="Ürün kapak görseli"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center bg-gradient-to-br from-slate-200 to-slate-500 font-bold text-white">
                    Kapak Görseli
                  </div>
                )}
              </div>

              <label className="block text-sm font-bold text-slate-700">
                Görsel Yükle
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={updateImage}
                  className="mt-3 w-full cursor-pointer rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-blue-900 file:px-4 file:py-2 file:font-bold file:text-white hover:file:bg-blue-800 focus:border-blue-900"
                />
              </label>
              <p className="text-xs font-semibold text-slate-500">
                JPG, PNG veya WEBP formatında en fazla 2 MB görsel yükleyin.
              </p>
            </div>
          </section>

          <section className="rounded-md border border-slate-300 bg-white p-8">
            <SectionTitle title="Kategori" marker="K" />

            <label className="mt-8 block text-sm font-bold text-slate-700">
              Kategori Seçimi
              <select
                required
                value={form.category_id}
                onChange={(event) =>
                  updateField("category_id", event.target.value)
                }
                className="mt-3 h-14 w-full cursor-pointer rounded-md border border-slate-300 bg-white px-4 text-lg outline-none transition focus:border-blue-900"
              >
                <option value="">Bir kategori seçin</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="rounded-md border border-blue-200 bg-blue-100 p-8">
            <button
              type="submit"
              disabled={isSaving}
              className="h-16 w-full cursor-pointer rounded-md bg-blue-900 font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSaving ? "Kaydediliyor" : "Kaydet"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="mt-5 h-16 w-full cursor-pointer rounded-md border border-blue-900 font-black text-blue-950 transition hover:bg-white"
            >
              İptal
            </button>
            <label className="mt-8 flex items-center gap-3 font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  updateField("is_active", event.target.checked)
                }
                className="h-4 w-4 cursor-pointer accent-blue-900"
              />
              Ürün aktif olarak yayında
            </label>
          </section>
        </div>
      </div>

    </form>
  );
}
