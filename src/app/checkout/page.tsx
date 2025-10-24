'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, Loader2, CheckCircle, XCircle } from 'lucide-react';
import CartItemComponent from '@/components/CartItem';
import { Separator } from '@/components/ui/separator';

type CheckoutStatus = 'pending_tap' | 'processing' | 'success' | 'error';

interface StatusData {
  tagId: string;
}

interface UserData {
  name: string;
  credit_balance: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { cartItems, total, itemCount, clearCart } = useCart();
  const [status, setStatus] = useState<CheckoutStatus>('pending_tap');
  const [errorMessage, setErrorMessage] = useState('');

  const statusDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'status', 'ui') : null),
    [firestore]
  );
  const { data: statusData } = useDoc<StatusData>(statusDocRef);

  useEffect(() => {
    // This effect triggers the payment process when a card is tapped.
    if (status === 'pending_tap' && statusData?.tagId && firestore) {
      handlePayment(statusData.tagId);
    }
  }, [statusData, status, firestore]);
  
  useEffect(() => {
    // If the cart is empty, redirect to the home page.
    if (itemCount === 0 && status !== 'success') {
      router.push('/');
    }
  }, [itemCount, status, router]);


  const handlePayment = async (tagId: string) => {
    if (!firestore) return;
    
    setStatus('processing');

    const userRef = doc(firestore, 'users', tagId);
    const orderData = {
        userId: tagId,
        orderDate: serverTimestamp(),
        totalAmount: total,
        itemCount: itemCount,
        orderItems: cartItems.map(item => ({
            menuItemId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
        })),
        status: 'completed',
    };

    try {
      await runTransaction(firestore, async (transaction) => {
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists()) {
          throw new Error("Card not registered. Please register your card.");
        }

        const userData = userDoc.data() as UserData;
        const currentBalance = userData.credit_balance || 0;

        if (currentBalance < total) {
          throw new Error(`Insufficient funds. Your balance is Rs. ${currentBalance.toFixed(2)}`);
        }

        const newBalance = currentBalance - total;
        transaction.update(userRef, { credit_balance: newBalance });

        const ordersCollection = doc(collection(firestore, "orders"));
        transaction.set(ordersCollection, orderData);
      });

      setStatus('success');
      clearCart();
    } catch (error: any) {
      console.error("Payment failed: ", error);
      setErrorMessage(error.message || "An unexpected error occurred.");
      setStatus('error');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="text-center py-6">
            <div className="flex justify-center mb-4">
              <Loader2 className="w-20 h-20 animate-spin text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-primary">Processing Payment...</h3>
            <p className="text-muted-foreground mt-1">Please wait.</p>
          </div>
        );
      case 'success':
        return (
          <div className="text-center py-6">
            <div className="flex justify-center mb-4 text-green-500">
              <CheckCircle className="w-20 h-20" />
            </div>
            <h3 className="text-2xl font-bold text-green-500">Payment Successful!</h3>
            <p className="text-muted-foreground mt-1">Your order has been placed.</p>
          </div>
        );
      case 'error':
        return (
          <div className="text-center py-6">
            <div className="flex justify-center mb-4 text-destructive">
              <XCircle className="w-20 h-20" />
            </div>
            <h3 className="text-2xl font-bold text-destructive">Payment Failed</h3>
            <p className="text-muted-foreground mt-1">{errorMessage}</p>
          </div>
        );
      case 'pending_tap':
      default:
        return (
          <div className="text-center py-6 bg-green-500/10 rounded-lg border-2 border-dashed border-green-500/50">
            <div className="flex justify-center mb-4">
              <div className="relative flex items-center justify-center w-32 h-32">
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
                <div className="relative flex items-center justify-center w-24 h-24 bg-green-500/90 text-primary-foreground rounded-full shadow-lg">
                  <Wifi className="w-16 h-16" />
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-green-600">Tap Your RFID Card to Pay</h3>
            <p className="text-muted-foreground mt-1">Hold your card near the reader to complete your purchase.</p>
          </div>
        );
    }
  };
  
  const handleBackToMenu = () => {
    router.push('/');
  }

  const handleTryAgain = () => {
    setStatus('pending_tap');
    setErrorMessage('');
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-background/95 p-6 flex flex-col">
            <CardHeader>
                <CardTitle className="text-2xl md:text-3xl font-bold">Your Order</CardTitle>
                <CardDescription>Review your items before payment.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4 overflow-y-auto max-h-[50vh]">
                 {cartItems.length > 0 ? (
                    cartItems.map(item => <CartItemComponent key={item.id} item={item} />)
                ) : (
                    <p className="text-muted-foreground text-center py-8">Your cart is empty.</p>
                )}
            </CardContent>
            <CardFooter className="flex-col items-stretch space-y-2 mt-auto pt-6">
                <Separator/>
                <div className="flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span>Rs.{total.toFixed(2)}</span>
                </div>
            </CardFooter>
        </div>
        <div className="flex flex-col bg-muted/30 p-6">
          <div className="flex-grow flex flex-col items-center justify-center">
            {renderContent()}
          </div>
           <div className="flex flex-col sm:flex-row gap-2 justify-center mt-6">
            {status === 'success' || status === 'error' ? (
                 <>
                    <Button onClick={handleBackToMenu} variant="outline" className="w-full text-lg h-12">
                        Back to Menu
                    </Button>
                    {status === 'error' && (
                         <Button onClick={handleTryAgain} className="w-full text-lg h-12">
                            Try Again
                        </Button>
                    )}
                </>
            ) : (
                 <Button onClick={handleBackToMenu} variant="outline" className="w-full text-lg h-12">
                    Cancel
                </Button>
            )}
           </div>
        </div>
      </Card>
    </div>
  );
}
