"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * The institution symbol shown next to a bank name.
 *
 * Products are stored with the institution's Korean name, which is also what the official
 * sources use, so that string is the key. An institution without a file here renders nothing
 * rather than a placeholder, and a file that fails to load hides itself, so a newly registered
 * bank can never leave a broken image on a product card.
 *
 * KB증권 and KB국민은행 are both KB Financial Group and share one symbol.
 */
const logos: Record<string, string> = {
  KB국민은행: "/banks/kb.png",
  KB증권: "/banks/kb.png",
  신한은행: "/banks/shinhan.png",
  하나은행: "/banks/hana.png",
};

export function BankLogo({ institution, size = 20 }: { institution: string; size?: number }) {
  const source = logos[institution];
  const [failed, setFailed] = useState(false);
  if (!source || failed) return null;
  return (
    <Image
      alt=""
      className="shrink-0 object-contain"
      height={size}
      onError={() => setFailed(true)}
      src={source}
      width={size}
    />
  );
}
