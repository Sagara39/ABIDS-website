'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { setDoc, doc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import VirtualKeyboard from '@/components/VirtualKeyboard';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phoneNumber: z.string().regex(/^\d{10}$/, { message: 'Please enter a valid 10-digit phone number.' }),
});

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const { user } = useUser();
  const [activeField, setActiveField] = useState<'name' | 'phoneNumber' | null>('name');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore || !auth) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firebase not initialized.' });
      return;
    }

    try {
      let currentUser = user;
      if (!currentUser) {
        const userCredential = await signInAnonymously(auth);
        currentUser = userCredential.user;
      }

      if (!currentUser) {
        throw new Error('Could not get user.');
      }
      
      const userRef = doc(firestore, 'users', currentUser.uid);
      await setDoc(userRef, values, { merge: true });

      toast({ title: 'Success', description: 'Your information has been saved.' });
      router.push('/');
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error.message || 'An unexpected error occurred.',
      });
    }
  };

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

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="flex-grow flex items-center justify-center p-4">
            <Card className="w-full max-w-lg shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl">Register Your Account</CardTitle>
                    <CardDescription>Enter your name and phone number to get started.</CardDescription>
                </CardHeader>
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                             <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                            <Button type="submit" className="text-lg h-12">Register</Button>
                        </CardFooter>
                    </form>
                </FormProvider>
            </Card>
        </div>

        <div className="sticky bottom-0 left-0 right-0 w-full bg-muted p-2 shadow-inner">
             <VirtualKeyboard
                onKeyPress={handleKeyPress}
                onBackspace={handleBackspace}
                onClear={handleClear}
                isNumeric={activeField === 'phoneNumber'}
            />
        </div>
    </div>
  );
}
