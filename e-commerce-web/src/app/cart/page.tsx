export default function CartPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black text-blue-950">Sepet</h1>
      <p className="mt-2 text-slate-600">
        Sepet satırları, toplam fiyat ve para birimi dönüşümü burada
        gösterilecek.
      </p>

      <div className="mt-8 rounded-md border border-dashed border-slate-300 bg-white p-8 text-slate-600">
        Sepet arayüzü backend cart endpointlerine bağlanacak.
      </div>
    </section>
  );
}
