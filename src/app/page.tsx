import Cart from "@/components/Cart";
import PageHeader from "@/components/PageHeader";
import Menu from "@/components/Menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Wallet } from "lucide-react";

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
            <div className="sticky top-24 flex flex-col gap-8">
              <Cart />
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">More Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <Link href="/register" passHref>
                    <Button size="lg" className="w-full h-14 text-lg">
                      <UserPlus className="mr-2" />
                      Register Card
                    </Button>
                  </Link>
                  <Link href="/balance" passHref>
                    <Button size="lg" className="w-full h-14 text-lg" variant="outline">
                      <Wallet className="mr-2" />
                      Check Balance
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
