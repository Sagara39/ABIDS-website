'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, Loader2, CheckCircle, XCircle, User as UserIcon } from 'lucide-react';
import CartItemComponent from '@/components/CartItem';
import { Separator } from '@/components/ui/separator';

type CheckoutStatus = 'pending_tap' | 'card_detected' | 'processing' | 'success' | 'error';

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
  const { cartItems, total, itemCount, placeOrder } = useCart();
  const [status, setStatus] = useState<CheckoutStatus>('pending_tap');
  const [errorMessage, setErrorMessage] = useState('');
  const [tagId, setTagId] = useState<string | null>(null);

  const statusDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'status', 'ui') : null),
    [firestore]
  );
  const { data: statusData } = useDoc<StatusData>(statusDocRef);
  
  const userDocRef = useMemoFirebase(
    () => (firestore && tagId ? doc(firestore, 'users', tagId) : null),
    [firestore, tagId]
  );
  const { data: userData, isLoading: isUserLoading } = useDoc<UserData>(userDocRef);

  const clearStatusDoc = () => {
    if (firestore && statusDocRef) {
      setDoc(statusDocRef, { tagId: null, message: '' }, { merge: true });
    }
  }

  useEffect(() => {
    if (itemCount === 0 && status !== 'success') {
      router.push('/');
    }
  }, [itemCount, status, router]);

  useEffect(() => {
    if (status === 'pending_tap' && statusData?.tagId && statusData.tagId !== tagId) {
      setTagId(statusData.tagId);
      setStatus('card_detected');
    }
  }, [statusData, status, tagId]);

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        handleFinish();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  const handleConfirmPayment = async () => {
    if (!tagId || !userData) {
      setErrorMessage('No valid user card detected. Please tap your card again.');
      setStatus('error');
      clearStatusDoc();
      return;
    }
    
    setStatus('processing');

    try {
      await placeOrder(tagId);
      setStatus('success');
    } catch (error: any) {
      console.error("Payment failed: ", error);
      setErrorMessage(error.message || "An unexpected error occurred.");
      setStatus('error');
    } finally {
      clearStatusDoc();
    }
  };
  
  const handleCancel = () => {
    clearStatusDoc();
    router.push('/');
  }

  const handleFinish = () => {
    clearStatusDoc();
    router.push('/');
  }
  
  const handleRetry = () => {
    setTagId(null);
    setStatus('pending_tap');
    setErrorMessage('');
    clearStatusDoc();
  }

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
            <p className="text-muted-foreground mt-1">Your order has been placed. Redirecting soon...</p>
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
      case 'card_detected':
        return (
          <div className="text-center py-6">
            {isUserLoading ? (
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
            ) : userData ? (
              <>
                <div className="flex justify-center mb-4 text-green-500">
                  <CheckCircle className="w-20 h-20" />
                </div>
                <h3 className="text-2xl font-bold">Card Detected</h3>
                <div className="flex justify-center items-center gap-2 mt-2">
                    <UserIcon className="w-6 h-6 text-muted-foreground" />
                    <p className="text-xl font-semibold">{userData.name}</p>
                </div>
                <p className="text-muted-foreground">Ready to pay.</p>
              </>
            ) : (
                 <div className="text-center py-6">
                    <div className="flex justify-center mb-4 text-destructive">
                        <XCircle className="w-20 h-20" />
                    </div>
                    <h3 className="text-2xl font-bold text-destructive">Card Not Found</h3>
                    <p className="text-muted-foreground mt-1">This RFID card is not registered.</p>
                 </div>
            )}
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
            <p className="text-muted-foreground mt-1">Hold your card near the reader to proceed.</p>
          </div>
        );
    }
  };
  
  const renderFooter = () => {
    switch(status) {
        case 'card_detected':
            return (
                <>
                    <Button onClick={handleCancel} variant="outline" className="w-full text-lg h-12">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmPayment} className="w-full text-lg h-12" disabled={isUserLoading || !userData}>
                        {isUserLoading ? 'Verifying...' : `Confirm Payment for ${userData?.name}`}
                    </Button>
                </>
            );
        case 'success':
            return (
                <Button onClick={handleFinish} variant="outline" className="w-full text-lg h-12">
                    Back to Menu
                </Button>
            );
        case 'error':
             return (
                 <>
                    <Button onClick={handleCancel} variant="outline" className="w-full text-lg h-12">
                        Cancel
                    </Button>
                    <Button onClick={handleRetry} className="w-full text-lg h-12">
                        Try Again
                    </Button>
                </>
            );
        case 'pending_tap':
        case 'processing':
        default:
             return (
                 <Button onClick={handleCancel} variant="outline" className="w-full text-lg h-12">
                    Cancel
                </Button>
            );
    }
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
                <div className="flex justify-between font-bold text-4xl">
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
            {renderFooter()}
           </div>
        </div>
      </Card>
    </div>
  );
}
