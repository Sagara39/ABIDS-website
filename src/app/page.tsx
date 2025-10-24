import Cart from "@/components/Cart";
import PageHeader from "@/components/PageHeader";
import Menu from "@/components/Menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          <main className="md:col-span-2">
            <PageHeader />
            <Menu />
          </main>
          <aside className="md:col-span-1">
            <div className="sticky top-24">
              <Cart />
            </div>
          </aside>
        </div>
      </div>
      <div className="fixed bottom-4 right-4 z-50">
        <Link href="/balance">
          <Button size="lg" className="h-14 text-lg shadow-2xl w-48">
            Check Balance
          </Button>
        </Link>
      </div>
    </>
  );
}
