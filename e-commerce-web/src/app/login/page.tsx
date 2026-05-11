import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
      <div className="flex flex-col justify-center">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-800">
          Güvenli giriş
        </p>
        <h1 className="mt-4 max-w-xl text-4xl font-black text-blue-950 sm:text-5xl">
          DehaCommerce hesabına giriş yap
        </h1>
        <p className="mt-5 max-w-xl leading-7 text-slate-600">
          JWT token Next.js proxy tarafında httpOnly cookie olarak saklanır.
          Laravel API adresi ve proxy secret bilgisi tarayıcıya açılmaz.
        </p>
      </div>

      <LoginForm />
    </section>
  );
}
