'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function BalancePage() {
    const router = useRouter();

  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-2xl shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-background/95 p-6 text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold">Check Your Balance</CardTitle>
          <CardDescription>Hold your RFID card near the reader to view your balance.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
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
            <p className="text-muted-foreground mt-1">Hold your card near the reader.</p>
          </div>
        </CardContent>
         <CardFooter className="flex justify-center bg-muted/30 p-6">
            <Button
                onClick={() => router.push('/')}
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
