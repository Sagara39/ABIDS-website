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
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { setDoc, doc } from 'firebase/firestore';
import VirtualKeyboard from '@/components/VirtualKeyboard';
import { Wifi } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phoneNumber: z.string().regex(/^\d{10}$/, { message: 'Please enter a valid 10-digit phone number.' }),
});

type RegistrationFormValues = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [activeField, setActiveField] = useState<'name' | 'phoneNumber' | null>('name');
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [formData, setFormData] = useState<RegistrationFormValues | null>(null);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
    },
  });

  const statusDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'status', 'ui') : null),
    [firestore]
  );
  const { data: statusData } = useDoc<{ message: string; tagId: string }>(statusDocRef);

  useEffect(() => {
    if (isFormSubmitted && statusData && formData) {
      const { message, tagId } = statusData;

      if (message === 'unregistered' && tagId) {
        const registerUser = async () => {
          if (!firestore) return;
          try {
            const userRef = doc(firestore, 'users', tagId);
            await setDoc(userRef, { ...formData });
            toast({ title: 'Success!', description: 'Your card has been registered.' });
            router.push('/');
          } catch (error: any) {
            console.error('Failed to create user:', error);
            toast({
              variant: 'destructive',
              title: 'Registration Failed',
              description: 'Could not save user data.',
            });
            setIsFormSubmitted(false); // Allow user to try again
          }
        };
        registerUser();
      } else if (message === 'registered' && tagId) {
        toast({
          variant: 'destructive',
          title: 'Card Already Registered',
          description: 'This card is already linked to an account.',
        });
        // Reset to allow another attempt or different action
        setTimeout(() => setIsFormSubmitted(false), 3000); 
      }
    }
  }, [statusData, isFormSubmitted, formData, firestore, toast, router]);


  const onSubmit = (values: RegistrationFormValues) => {
    setFormData(values);
    setIsFormSubmitted(true);
    toast({ title: 'Form submitted', description: 'Please tap your RFID card to continue.'})
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
              {!isFormSubmitted ? (
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
                              <Button type="submit" className="text-lg h-12">Register</Button>
                          </CardFooter>
                      </form>
                  </FormProvider>
                </>
              ) : (
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
                      <Button variant="outline" onClick={() => setIsFormSubmitted(false)}>
                          Back to Form
                      </Button>
                  </CardFooter>
                </>
              )}
            </Card>
        </div>

        {!isFormSubmitted && (
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
