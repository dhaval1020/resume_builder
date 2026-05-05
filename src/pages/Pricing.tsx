import { resumeTemplates, templateCategories } from "@/types/templates";
import { useAuth } from "@/contexts/AuthContext";
import { usePurchasedTemplates } from "@/hooks/usePurchasedTemplates";
import { useTemplateCart } from "@/hooks/useTemplateCart";
import { apiFetch } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, IndianRupee, Lock, FileText, ArrowLeft, ShoppingCart, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

const CCAVENUE_CHECKOUT_STORAGE_KEY = "ccavenue_checkout_payload";

const Pricing = () => {
  const { user } = useAuth();
  const { isOwned, isFree, refreshPurchased } = usePurchasedTemplates();
  const { cartTemplateIds, addToCart, removeFromCart, clearCart, isInCart } = useTemplateCart();
  const navigate = useNavigate();

  const cartTemplates = resumeTemplates.filter((template) => cartTemplateIds.includes(template.id));
  const payableTemplates = cartTemplates.filter((template) => !isOwned(template.id) && !isFree(template.id));
  const totalInr = payableTemplates.length * 10;

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const payment = params.get("payment");
      const orderId = params.get("orderId");
      const message = params.get("message");
      if (!payment || !orderId) return;

      navigate("/pricing", { replace: true });

      if (payment === "success") {
        try {
          const status = await apiFetch<{ status: string; templateIds: string[] }>(
            `/api/checkout/order-status/${orderId}`,
            {},
            true
          );

          status.templateIds.forEach((templateId) => removeFromCart(templateId));
          await refreshPurchased();
          toast.success(message || "Payment successful. Templates unlocked.");
        } catch (error) {
          const errMessage = error instanceof Error ? error.message : "Unable to refresh purchased templates";
          toast.error(errMessage);
        }
        return;
      }

      toast.error(message || "Payment failed. Please try again.");
    };

    run();
  }, [navigate, refreshPurchased, removeFromCart]);

  const handleAddToCart = (templateId: string, templateName: string) => {
    if (isOwned(templateId) || isFree(templateId)) return;
    if (isInCart(templateId)) {
      toast.info("Already in cart");
      return;
    }
    addToCart(templateId);
    toast.success(`${templateName} added to cart`);
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please sign in before checkout");
      navigate("/auth");
      return;
    }

    if (payableTemplates.length === 0) {
      toast.info("Your cart has no payable templates");
      return;
    }

    try {
      const order = await apiFetch<{
        paymentUrl: string;
        accessCode: string;
        encRequest: string;
      }>(
        "/api/checkout/create-order",
        {
          method: "POST",
          body: JSON.stringify({
            templateIds: payableTemplates.map((template) => template.id),
            returnUrl: `${window.location.origin}/pricing`,
          }),
        },
        true
      );

      sessionStorage.setItem(
        CCAVENUE_CHECKOUT_STORAGE_KEY,
        JSON.stringify({
          paymentUrl: order.paymentUrl,
          encRequest: order.encRequest,
          accessCode: order.accessCode,
        })
      );
      navigate("/ccavenue-checkout");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to start checkout";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-display font-bold text-foreground">ResumeForge</h1>
          </div>
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Editor
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <Card className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-primary" /> Cart & Payment
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Add templates to cart from editor or marketplace, then complete payment securely.
              </p>
            </div>
            {cartTemplates.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearCart}>
                Clear Cart
              </Button>
            )}
          </div>

          {cartTemplates.length === 0 ? (
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
          ) : (
            <div className="space-y-2">
              {cartTemplates.map((template) => {
                const owned = isOwned(template.id) || isFree(template.id);
                return (
                  <div key={template.id} className="flex items-center justify-between rounded-md border border-border p-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{template.name}</p>
                      <p className="text-xs text-muted-foreground">{owned ? "Already available" : "INR 10"}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(template.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Payable items: {payableTemplates.length}</p>
              <p className="text-lg font-bold text-foreground">Total: INR {totalInr}</p>
            </div>
            <Button onClick={handleCheckout} disabled={payableTemplates.length === 0}>
              <Lock className="w-4 h-4 mr-2" /> Proceed to Secure Payment
            </Button>
          </div>
        </Card>

        <div>
          <h3 className="text-2xl font-display font-bold text-foreground mb-4">Template Marketplace</h3>
          {templateCategories.map((cat) => (
            <div key={cat} className="mb-8">
              <h4 className="text-lg font-display font-bold text-foreground mb-4">{cat}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {resumeTemplates
                  .filter((template) => template.category === cat)
                  .map((template) => {
                    const owned = isOwned(template.id);
                    const free = isFree(template.id);
                    const inCart = isInCart(template.id);

                    return (
                      <Card key={template.id} className="p-4 space-y-3">
                        <div>
                          <h5 className="font-display font-bold text-foreground">{template.name}</h5>
                          <p className="text-xs text-muted-foreground">{template.description}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          {free ? (
                            <span className="text-sm font-bold text-score-high">FREE</span>
                          ) : (
                            <span className="flex items-center text-sm font-bold text-foreground">
                              <IndianRupee className="w-3.5 h-3.5" />10
                            </span>
                          )}

                          {owned ? (
                            <Button size="sm" variant="secondary" disabled>
                              <Check className="w-4 h-4 mr-1" /> Owned
                            </Button>
                          ) : free ? (
                            <Button size="sm" variant="secondary" disabled>
                              <Check className="w-4 h-4 mr-1" /> Free
                            </Button>
                          ) : inCart ? (
                            <Button size="sm" variant="secondary" disabled>
                              In Cart
                            </Button>
                          ) : (
                            <Button size="sm" onClick={() => handleAddToCart(template.id, template.name)}>
                              Add to Cart
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
