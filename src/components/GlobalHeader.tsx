import { UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function GlobalHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-black backdrop-blur-sm shadow-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-primary-foreground/10 p-2 rounded-lg">
            <UtensilsCrossed className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-primary-foreground">
            ABIDS
          </h1>
        </Link>
        <Image
          src="/usj.png"
          alt="Logo"
          width={50}
          height={50}
          className="object-contain"
          priority
        />
      </div>
    </header>
  );
}
