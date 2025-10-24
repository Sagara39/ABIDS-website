'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFirestore } from '@/firebase';
import { setDoc, doc, serverTimestamp, getDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import VirtualKeyboard from '@/components/VirtualKeyboard';
import { Wifi, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phoneNumber: z.string().regex(/^\d{10}$/, { message: 'Please enter a valid 10-digit phone number.' }),
});

type RegistrationFormValues = z.infer<typeof formSchema>;

type RegistrationStatus = 'form' | 'tapping' | 'submitting' | 'error' | 'success';

export default function RegisterPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const [activeField, setActiveField] = useState<'name' | 'phoneNumber' | null>('name');
  const [status, setStatus] = useState<RegistrationStatus>('form');
  const [errorMessage, setErrorMessage] = useState('');

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
    },
  });

  const statusDocRef = doc(firestore, 'status', 'ui');
  
  const clearStatusDoc = () => {
    if (statusDocRef) {
        setDoc(statusDocRef, { tagId: null, message: '' }, { merge: true });
    }
  }

  useEffect(() => {
    // Clear status on initial load to prevent using a stale tagId
    clearStatusDoc();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const waitForCardTap = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!statusDocRef) return reject('Firestore not available');
        const unsubscribe = onSnapshot(statusDocRef, (doc) => {
            const tagId = doc.data()?.tagId;
            if (tagId) {
                unsubscribe();
                resolve(tagId);
            }
        });
    });
  }

  const onSubmit = async (values: RegistrationFormValues) => {
    if (!firestore) return;
    setStatus('tapping');
    
    try {
      const tagId = await waitForCardTap();
      setStatus('submitting');
      
      // Check if phone number already exists
      const phoneQuery = query(collection(firestore, 'users'), where('phoneNumber', '==', values.phoneNumber));
      const phoneSnapshot = await getDocs(phoneQuery);

      if (!phoneSnapshot.empty) {
        setErrorMessage('This phone number is already registered.');
        setStatus('error');
        clearStatusDoc();
        return;
      }
      
      const userCheckRef = doc(firestore, 'users', tagId);
      const userDoc = await getDoc(userCheckRef);

      if (userDoc.exists()) {
        setErrorMessage('This card is already linked to an account. Please use a different card.');
        setStatus('error');
        clearStatusDoc();
        return;
      }

      await setDoc(userCheckRef, { 
          ...values,
          credit_balance: 0,
          lastTransaction: serverTimestamp()
      });
      
      await setDoc(statusDocRef, { message: 'registered' }, { merge: true });
      
      setStatus('success');

    } catch (error: any) {
        console.error('Failed to create user:', error);
        setErrorMessage(error.message || 'Could not save user data.');
        setStatus('error');
    }
  };

  const handleFinish = async () => {
    clearStatusDoc();
    router.push('/');
  }

  const handleKeyPress = (key: string) => {
    if (activeField) {
      const currentVal = form.getValues(activeField);
      form.setValue(activeField, currentVal + key);
    }
  };

  const handleBackspace = () => {
    if (activeField) {
      const currentVal = form.getValues(activeField);
      form.setValue(activeField, currentVal.slice(0, -1));
    }
  };
  
  const handleClear = () => {
    if (activeField) {
      form.setValue(activeField, '');
    }
  }
  
  const handleRetry = () => {
    setStatus('form');
    clearStatusDoc();
  }


  const renderCardContent = () => {
    switch (status) {
      case 'success':
        return (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Registration Successful</CardTitle>
              <CardDescription>Your account is ready to use.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-green-500">
                <div className="flex justify-center mb-4">
                    <CheckCircle className="w-32 h-32" />
                </div>
                <h3 className="text-2xl font-bold">
                  All Set!
                </h3>
                <p className="text-muted-foreground mt-1">You can now use your card for payments.</p>
              </div>
            </CardContent>
             <CardFooter className="flex justify-center">
                <Button onClick={handleFinish} className="text-lg h-12">Finish</Button>
            </CardFooter>
          </>
        )
      case 'tapping':
          return (
              <>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Link Your Card</CardTitle>
                  <CardDescription>Your details are saved. Please link your card to finalize.</CardDescription>
                </CardHeader>
                <CardContent>
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
                      Tap Your RFID Card
                    </h3>
                    <p className="text-muted-foreground mt-1">Hold your card near the reader to link your account.</p>
                  </div>
                </CardContent>
                 <CardFooter className="flex justify-center">
                    <Button variant="outline" onClick={() => setStatus('form')}>
                        Back to Form
                    </Button>
                </CardFooter>
              </>
            )
      case 'submitting':
            return (
                <CardContent>
                    <div className="text-center py-6">
                        <div className="flex justify-center mb-4">
                        <Loader2 className="w-20 h-20 animate-spin text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold text-primary">Registering Card...</h3>
                        <p className="text-muted-foreground mt-1">Please wait.</p>
                    </div>
                </CardContent>
            );
      case 'error':
        return (
          <>
            <CardHeader className="text-center">
                <CardTitle className="text-2xl text-destructive">Registration Error</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center py-6 text-destructive">
                    <div className="flex justify-center mb-4">
                        <XCircle className="w-32 h-32" />
                    </div>
                    <h3 className="text-2xl font-bold">{errorMessage}</h3>
                    <p className="text-muted-foreground mt-1">Please try again or contact support.</p>
                </div>
            </CardContent>
            <CardFooter className="flex justify-center">
                <Button onClick={handleRetry} className="text-lg h-12">Try Again</Button>
            </CardFooter>
          </>
        )
      case 'form':
      default:
        return (
            <>
            <CardHeader>
                <CardTitle className="text-2xl">Register Your Account</CardTitle>
                <CardDescription>Enter your name and phone number to get started.</CardDescription>
            </CardHeader>
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="John Doe"
                                            {...field}
                                            onFocus={() => setActiveField('name')}
                                            className="text-lg p-4"
                                            readOnly
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="0123456789"
                                            {...field}
                                            onFocus={() => setActiveField('phoneNumber')}
                                            className="text-lg p-4"
                                            readOnly
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" className="text-lg h-12">Next: Tap Card</Button>
                    </CardFooter>
                </form>
            </FormProvider>
          </>
        )
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="flex-grow flex items-center justify-center p-4">
            <Card className="w-full max-w-lg shadow-2xl">
              {renderCardContent()}
            </Card>
        </div>

        {status === 'form' && (
          <div className="sticky bottom-0 left-0 right-0 w-full bg-muted p-2 shadow-inner">
              <VirtualKeyboard
                  onKeyPress={handleKeyPress}
                  onBackspace={handleBackspace}
                  onClear={handleClear}
                  isNumeric={activeField === 'phoneNumber'}
              />
          </div>
        )}
    </div>
  );
}
