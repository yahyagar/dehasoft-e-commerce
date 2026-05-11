"use client";

import type { AuthClientResponse } from "@/types/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type RegisterState = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterState>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const result = (await response.json()) as AuthClientResponse;

      if (!response.ok) {
        setError(result.message ?? "Kayıt başarısız.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Kayıt isteği gönderilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-md border border-slate-200 bg-white p-6 shadow-sm"
    >
      <label className="block text-sm font-semibold text-slate-800">
        Ad Soyad
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          placeholder="Test User"
          className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 outline-none transition focus:border-blue-800"
          required
        />
      </label>

      <label className="mt-5 block text-sm font-semibold text-slate-800">
        E-posta
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={(event) =>
            setForm((current) => ({ ...current, email: event.target.value }))
          }
          placeholder="test@dehasoft.com"
          className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 outline-none transition focus:border-blue-800"
          required
        />
      </label>

      <label className="mt-5 block text-sm font-semibold text-slate-800">
        Şifre
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              password: event.target.value,
            }))
          }
          placeholder="••••••••"
          className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 outline-none transition focus:border-blue-800"
          required
        />
      </label>

      <label className="mt-5 block text-sm font-semibold text-slate-800">
        Şifre Tekrarı
        <input
          type="password"
          name="password_confirmation"
          value={form.password_confirmation}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              password_confirmation: event.target.value,
            }))
          }
          placeholder="••••••••"
          className="mt-2 h-12 w-full rounded-md border border-slate-300 px-4 outline-none transition focus:border-blue-800"
          required
        />
      </label>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 h-12 w-full rounded-md bg-blue-900 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting ? "Kayıt oluşturuluyor..." : "Kayıt Ol"}
      </button>
    </form>
  );
}
