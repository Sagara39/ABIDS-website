"use client";

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
import { Separator } from "@/components/ui/separator";
import CartItem from "./CartItem";
import { ShoppingCart, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Cart() {
  const { cartItems, total, clearCart, itemCount } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    if (itemCount > 0) {
      router.push('/checkout');
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-6 h-6 text-primary" />
          <CardTitle className="text-xl">Your Order</CardTitle>
        </div>
        {cartItems.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearCart}
            aria-label="Clear cart"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">Your cart is empty</p>
            <p className="text-sm text-muted-foreground/80">Add items from the menu to get started.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto p-1">
            {cartItems.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </CardContent>
      {cartItems.length > 0 && (
        <CardFooter className="flex flex-col gap-4 p-4 border-t">
          <Separator />
          <div className="w-full flex justify-between items-center font-bold text-3xl">
            <span>Total</span>
            <span>Rs.{total.toFixed(2)}</span>
          </div>
          <Button
            onClick={handleCheckout}
            className="w-full h-12 text-lg font-bold bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={itemCount === 0}
          >
            Checkout ({itemCount} {itemCount > 1 ? 'items' : 'item'})
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
