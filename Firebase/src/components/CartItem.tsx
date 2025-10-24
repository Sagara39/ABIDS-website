"use client";

import Image from "next/image";
import type { CartItem } from "@/lib/types";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function CartItemComponent({ item }: { item: CartItem }) {
  const { updateQuantity, removeFromCart } = useCart();
  const localImage = PlaceHolderImages.find(img => img.name.toLowerCase() === item.name.toLowerCase());
  const imageUrl = localImage?.imageUrl || "/placeholder.png";
  const imageHint = localImage?.imageHint || "placeholder";


  return (
    <div className="flex items-center gap-4">
      <Image
        src={imageUrl}
        alt={item.name}
        width={64}
        height={64}
        className="rounded-md object-cover"
        data-ai-hint={imageHint}
      />
      <div className="flex-grow">
        <p className="font-semibold">{item.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            aria-label="Decrease quantity"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-6 text-center font-medium">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            aria-label="Increase quantity"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <p className="font-bold text-2xl">Rs.{(item.price * item.quantity).toFixed(2)}</p>
        <Button
            variant="ghost"
            size="icon"
            onClick={() => removeFromCart(item.id)}
            aria-label="Remove item"
            className="h-7 w-7 text-muted-foreground hover:text-destructive -mr-2"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
      </div>
    </div>
  );
}
