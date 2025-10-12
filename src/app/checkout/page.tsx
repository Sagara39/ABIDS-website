'use client';

import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Wifi } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function CheckoutPage() {
  const { cartItems, total, itemCount, confirmPayment } = useCart();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if cart is empty after a brief moment
    if (itemCount === 0) {
      const timer = setTimeout(() => router.replace('/'), 50); // Small delay to prevent flash
      return () => clearTimeout(timer);
    }
  }, [itemCount, router]);


  if (itemCount === 0) {
    // Render a loading/redirecting state to avoid showing an empty checkout page
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <p className="text-muted-foreground">Your cart is empty. Redirecting...</p>
        </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-2xl shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-background/95 p-6">
          <CardTitle className="text-2xl md:text-3xl font-bold">Confirm Your Order</CardTitle>
          <CardDescription>Review your items and tap your card to pay.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-foreground">Order Summary</h3>
            <div className="max-h-48 overflow-y-auto rounded-lg border bg-background/50 p-2 space-y-2">
              {cartItems.map(item => {
                const localImage = PlaceHolderImages.find(img => img.id === item.id);
                const imageUrl = localImage?.imageUrl || '/placeholder.png';
                const imageHint = localImage?.imageHint || 'placeholder';
                return (
                  <div key={item.id} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <Image
                      src={imageUrl}
                      alt={item.name}
                      width={56}
                      height={56}
                      className="rounded-lg object-cover"
                      data-ai-hint={imageHint}
                    />
                    <div className="flex-grow">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} x Rs.{item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-bold text-lg text-foreground">Rs.{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center font-bold text-xl">
            <span>Total ({itemCount} {itemCount > 1 ? 'items' : 'item'})</span>
            <span>Rs.{total.toFixed(2)}</span>
          </div>

          <Separator />

          <div className="text-center py-6 bg-accent/10 rounded-lg">
             <div className="flex justify-center mb-4">
              <div className="relative flex items-center justify-center w-40 h-40">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
                <div className="relative flex items-center justify-center w-32 h-32 bg-primary/90 text-primary-foreground rounded-full shadow-lg">
                  <Wifi className="w-20 h-20" />
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-primary">
              Tap Your RFID Card to Pay
            </h3>
            <p className="text-muted-foreground mt-1">Hold your card near the reader.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 bg-muted/30 p-6">
            <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full sm:w-auto text-lg h-12"
            >
                Cancel
            </Button>
            <Button
                onClick={confirmPayment}
                className="w-full sm:flex-grow h-12 text-lg font-bold bg-accent text-accent-foreground hover:bg-accent/90 shadow-md hover:shadow-lg transition-shadow"
            >
                Simulate RFID Payment
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
