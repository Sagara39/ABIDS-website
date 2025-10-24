"use client";

import Image from "next/image";
import type { MenuItem } from "@/lib/types";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default function MenuItemCard({ item }: { item: MenuItem }) {
  const { addToCart } = useCart();
  const imageUrl = item.imageUrl || "/placeholder.png";

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="aspect-video relative">
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            data-ai-hint={item.imageHint}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-bold mb-1">{item.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {item.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="text-3xl font-bold text-primary">
          Rs.{item.price.toFixed(2)}
        </p>
        <Button size="sm" onClick={() => addToCart(item)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}
