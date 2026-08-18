"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { useLocale } from "@/components/providers/locale-provider";
import type { Locale } from "@/i18n/config";

const countryOptions: Array<{
  locale: Locale;
  name: string;
  flag: string;
}> = [
  { locale: "ko", name: "대한민국", flag: "/flags/kr.svg" },
  { locale: "en", name: "US", flag: "/flags/us.svg" },
  { locale: "vi", name: "Việt Nam", flag: "/flags/vn.svg" },
];

export default function HomePage() {
  const router = useRouter();
  const { setLocale } = useLocale();

  const selectCountry = (locale: Locale) => {
    setLocale(locale);
    router.push("/profile");
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <section className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1500px] items-center justify-center bg-white px-6 py-16 shadow-[0_18px_55px_rgba(15,23,42,0.08)] sm:min-h-[calc(100vh-4rem)] sm:px-12">
        <div className="grid w-full max-w-[1340px] gap-10 md:grid-cols-3 md:gap-12 xl:gap-24">
          {countryOptions.map((country) => (
            <button
              key={country.locale}
              type="button"
              onClick={() => selectCountry(country.locale)}
              aria-label={`${country.name} 언어 선택`}
              className="group mx-auto flex aspect-square w-full max-w-[340px] flex-col items-center justify-center rounded-[38px] border-2 border-slate-900 bg-white px-8 py-10 transition duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
            >
              <span className="relative block aspect-square w-[72%] max-w-[235px] overflow-hidden rounded-full">
                <Image
                  src={country.flag}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 768px) 235px, 22vw"
                  className="object-cover transition duration-200 group-hover:scale-[1.03]"
                />
              </span>
              <span className="mt-7 whitespace-nowrap text-3xl font-medium tracking-tight text-black sm:text-4xl">
                {country.name}
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
