import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AdoptionCheckout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [adoptionFee] = useState(150);
  const [donationAmount, setDonationAmount] = useState(0);

  const checkoutMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/v1/adoptions/checkout", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment initiated",
        description: "Processing your adoption payment",
      });
      // In production, would redirect to Stripe checkout
      setTimeout(() => {
        setLocation("/adoptions");
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const suggestedDonations = [25, 50, 100, 200];
  const totalAmount = adoptionFee + donationAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkoutMutation.mutate({
      animalId: "sample-animal-id",
      adopterId: "sample-adopter-id",
      feeCents: adoptionFee * 100,
      donationCents: donationAmount * 100,
    });
  };

  return (
    <AppLayout title="Adoption Checkout" subtitle="Complete your adoption">
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card data-testid="card-checkout-form">
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Adopter Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Adopter Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" required data-testid="input-first-name" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" required data-testid="input-last-name" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" required data-testid="input-email" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" required data-testid="input-phone" />
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Method */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Payment Method</h3>
                    <div className="p-4 bg-muted rounded-lg border border-border">
                      <div className="flex items-center gap-3 mb-4">
                        <CreditCard className="w-5 h-5 text-primary" />
                        <span className="font-medium text-foreground">Credit or Debit Card</span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input id="cardNumber" placeholder="1234 5678 9012 3456" data-testid="input-card-number" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="expiry">Expiry</Label>
                            <Input id="expiry" placeholder="MM/YY" data-testid="input-expiry" />
                          </div>
                          <div>
                            <Label htmlFor="cvc">CVC</Label>
                            <Input id="cvc" placeholder="123" data-testid="input-cvc" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={checkoutMutation.isPending}
                    data-testid="button-complete-payment"
                  >
                    {checkoutMutation.isPending ? "Processing..." : `Complete Payment - $${totalAmount}`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4" data-testid="card-order-summary">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Animal Info */}
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-2xl">🐕</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Sample Animal</p>
                    <p className="text-sm text-muted-foreground">Golden Retriever</p>
                  </div>
                </div>

                {/* Fees */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Adoption Fee</span>
                    <span className="font-medium text-foreground" data-testid="text-adoption-fee">
                      ${adoptionFee}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Add a Donation</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {suggestedDonations.map((amount) => (
                        <Button
                          key={amount}
                          variant={donationAmount === amount ? "default" : "outline"}
                          size="sm"
                          onClick={() => setDonationAmount(amount)}
                          type="button"
                          data-testid={`button-donation-${amount}`}
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                    <Input
                      type="number"
                      placeholder="Custom amount"
                      className="mt-2"
                      value={donationAmount || ''}
                      onChange={(e) => setDonationAmount(Number(e.target.value))}
                      data-testid="input-custom-donation"
                    />
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex items-center justify-between text-lg font-bold">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary" data-testid="text-total-amount">
                    ${totalAmount}
                  </span>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Your donation helps us continue our mission of rescuing and caring for animals in need.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
