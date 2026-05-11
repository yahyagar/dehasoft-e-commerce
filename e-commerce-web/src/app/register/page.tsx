import { RegisterForm } from "@/components/register-form";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
      <div className="flex flex-col justify-center">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-800">
          Yeni hesap
        </p>
        <h1 className="mt-4 max-w-xl text-4xl font-black text-blue-950 sm:text-5xl">
          DehaCommerce hesabını oluştur
        </h1>
        <p className="mt-5 max-w-xl leading-7 text-slate-600">
          Kayıt olduktan sonra token güvenli şekilde httpOnly cookie içinde
          saklanır ve alışverişe devam edebilirsin.
        </p>
        <p className="mt-6 text-sm text-slate-600">
          Zaten hesabın var mı?{" "}
          <Link href="/login" className="font-bold text-blue-900">
            Giriş yap.
          </Link>
        </p>
      </div>

      <RegisterForm />
    </section>
  );
}
