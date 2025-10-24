'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi, Wallet, User as UserIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface StatusData {
  tagId: string;
}

interface UserData {
    name: string;
    credit_balance: number;
}

export default function BalancePage() {
  const router = useRouter();
  const firestore = useFirestore();
  
  const [view, setView] = useState<'prompt' | 'loading' | 'balance' | 'notFound'>('prompt');
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
    if (statusData && statusData.tagId) {
      if (statusData.tagId !== tagId) {
        setTagId(statusData.tagId);
        setView('loading');
      }
    }
  }, [statusData, tagId]);

  useEffect(() => {
    if (!tagId) {
      setView('prompt');
      return;
    }
    
    if (isUserLoading) {
      setView('loading');
      return;
    }

    if (userData) {
      setView('balance');
      clearStatusDoc();
    } else {
      setView('notFound');
      clearStatusDoc();
    }
  }, [tagId, userData, isUserLoading]);


  const handleBackToMenu = () => {
    setTagId(null);
    setView('prompt');
    clearStatusDoc();
    router.push('/');
  }

  const renderContent = () => {
    switch (view) {
      case 'loading':
        return (
          <div className="text-center py-6">
            <div className="flex justify-center mb-4">
              <Loader2 className="w-20 h-20 animate-spin text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-primary">Fetching Balance...</h3>
            <p className="text-muted-foreground mt-1">Please wait a moment.</p>
          </div>
        );
      case 'balance':
        return (
            <div className="text-center py-6">
                <div className="flex justify-center items-center gap-4 mb-2">
                    <UserIcon className="w-8 h-8 text-muted-foreground"/>
                    <p className="text-2xl font-semibold">{userData?.name}</p>
                </div>
                <div className="flex justify-center items-center gap-4 text-primary mb-4">
                    <Wallet className="w-12 h-12" />
                    <p className="text-9xl font-bold">
                        Rs. {typeof userData?.credit_balance === 'number' ? userData.credit_balance.toFixed(2) : '0.00'}
                    </p>
                </div>
                 <p className="text-muted-foreground mt-4">Your current account balance.</p>
            </div>
        );
      case 'notFound':
         return (
          <div className="text-center py-6">
            <h3 className="text-2xl font-bold text-destructive">Card Not Registered</h3>
            <p className="text-muted-foreground mt-1">This card is not linked to an account.</p>
             <p className="text-muted-foreground mt-1">Please register your card or try another one.</p>
          </div>
        );
      case 'prompt':
      default:
        return (
          <div className="text-center py-6 bg-accent/10 rounded-lg">
            <div className="flex justify-center mb-4">
              <div className="relative flex items-center justify-center w-40 h-40">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
                <div className="relative flex items-center justify-center w-32 h-32 bg-primary/90 text-primary-foreground rounded-full shadow-lg">
                  <Wifi className="w-20 h-20" />
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-primary">Tap Your RFID Card</h3>
            <p className="text-muted-foreground mt-1">Hold your card near the reader to check your balance.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-2xl shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-background/95 p-6 text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold">Check Your Balance</CardTitle>
          <CardDescription>
            {view === 'prompt' ? 'Hold your RFID card near the reader to view your balance.' : 'Here is your account information.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {renderContent()}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center bg-muted/30 p-6">
          <Button
            onClick={handleBackToMenu}
            variant="outline"
            className="w-full sm:w-auto text-lg h-12"
          >
            Back to Menu
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
