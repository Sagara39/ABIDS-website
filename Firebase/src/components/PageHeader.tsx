import { Utensils } from "lucide-react";

export default function PageHeader() {
  return (
    <header className="mb-8">
      <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight text-foreground">
        Today's Menu
      </h1>
      <p className="text-muted-foreground">
        Select items from the menu below and proceed to checkout in your cart.
      </p>
    </header>
  );
}
