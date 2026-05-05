import { resumeTemplates, templateCategories, ResumeTemplate } from "@/types/templates";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { LayoutTemplate, Lock, Check, IndianRupee, CreditCard } from "lucide-react";
import { usePurchasedTemplates } from "@/hooks/usePurchasedTemplates";
import { useTemplateCart } from "@/hooks/useTemplateCart";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface TemplateSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
  fullName?: string;
}

const CCAVENUE_CHECKOUT_STORAGE_KEY = "ccavenue_checkout_payload";

const templatePreviewStyles: Record<string, { header: string; body: string; accent: string }> = {
  classic: { header: "border-b-2 border-resume-border", body: "font-resume", accent: "bg-resume-heading" },
  traditional: { header: "border-b-4 border-foreground/80", body: "font-resume", accent: "bg-foreground/80" },
  conservative: { header: "border-b border-muted-foreground/40", body: "font-resume", accent: "bg-muted-foreground/50" },
  formal: { header: "border-y-2 border-resume-heading", body: "font-resume", accent: "bg-resume-heading" },
  executive: { header: "border-b-2 border-primary", body: "font-display", accent: "bg-primary" },
  corporate: { header: "border-b border-primary/60", body: "font-sans", accent: "bg-primary/80" },
  professional: { header: "bg-primary/10 rounded", body: "font-sans", accent: "bg-primary" },
  managerial: { header: "border-l-4 border-primary pl-2", body: "font-display", accent: "bg-primary" },
  modern: { header: "border-b border-accent", body: "font-sans", accent: "bg-accent" },
  sleek: { header: "border-b border-border", body: "font-sans", accent: "bg-muted-foreground" },
  clean: { header: "", body: "font-sans", accent: "bg-foreground/60" },
  sharp: { header: "bg-foreground text-card px-1", body: "font-sans", accent: "bg-foreground" },
  minimal: { header: "", body: "font-sans", accent: "bg-muted-foreground/40" },
  simple: { header: "border-b border-border", body: "font-sans", accent: "bg-border" },
  lite: { header: "", body: "font-sans", accent: "bg-muted" },
  developer: { header: "border-b border-accent", body: "font-mono", accent: "bg-accent" },
  engineer: { header: "border-b-2 border-foreground/70", body: "font-mono", accent: "bg-foreground/70" },
  "data-scientist": { header: "border-l-4 border-accent pl-1", body: "font-mono", accent: "bg-accent" },
  elegant: { header: "border-b border-resume-heading/40", body: "font-resume", accent: "bg-resume-heading/50" },
  bold: { header: "bg-primary text-card px-1 rounded-sm", body: "font-display", accent: "bg-primary" },
  compact: { header: "border-b border-border", body: "font-sans text-[10px]", accent: "bg-foreground/50" },
  academic: { header: "border-b-2 border-resume-heading", body: "font-resume", accent: "bg-resume-heading" },
};

const MiniPreview = ({ template }: { template: ResumeTemplate }) => {
  const s = templatePreviewStyles[template.id] || templatePreviewStyles.classic;
  return (
    <div className="w-full aspect-[4/5] bg-card border border-border rounded-sm p-1.5 flex flex-col gap-0.5">
      <div className={cn("h-2 w-10 mx-auto rounded-sm", s.accent)} />
      <div className={cn("h-px w-full my-0.5", s.header.includes("border") ? "border-b border-current opacity-30" : "")} />
      <div className="flex flex-col gap-0.5 flex-1">
        <div className={cn("h-1 w-8 rounded-sm", s.accent, "opacity-60")} />
        <div className="h-0.5 w-full bg-muted" />
        <div className="h-0.5 w-12 bg-muted" />
        <div className="h-0.5 w-10 bg-muted" />
        <div className={cn("h-1 w-8 rounded-sm mt-0.5", s.accent, "opacity-60")} />
        <div className="h-0.5 w-full bg-muted" />
        <div className="h-0.5 w-11 bg-muted" />
        <div className={cn("h-1 w-7 rounded-sm mt-0.5", s.accent, "opacity-60")} />
        <div className="h-0.5 w-full bg-muted" />
      </div>
    </div>
  );
};

const TemplateSelector = ({ selected, onSelect, fullName }: TemplateSelectorProps) => {
  const { user } = useAuth();
  const { isOwned, isFree } = usePurchasedTemplates(fullName);
  const { addToCart, removeFromCart, isInCart, cartCount, cartTemplateIds } = useTemplateCart();
  const navigate = useNavigate();

  const handleSelect = (templateId: string) => {
    onSelect(templateId);
    if (!isOwned(templateId) && !isFree(templateId)) {
      toast.info("Preview mode enabled. Purchase this template to download.");
    }
  };

  const handleAddToCart = (templateId: string, templateName: string) => {
    addToCart(templateId);
    toast.success(`${templateName} added to cart`);
  };

  const handleRemoveFromCart = (templateId: string, templateName: string) => {
    removeFromCart(templateId);
    toast.info(`${templateName} removed from cart`);
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please sign in before checkout");
      navigate("/auth");
      return;
    }

    const payableTemplateIds = cartTemplateIds.filter((templateId) => !isOwned(templateId) && !isFree(templateId));
    if (payableTemplateIds.length === 0) {
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
            templateIds: payableTemplateIds,
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-display font-bold text-foreground flex items-center gap-1.5">
          <LayoutTemplate className="w-4 h-4 text-primary" /> Templates
        </h2>
        <span className="text-xs text-muted-foreground">Cart: {cartCount}</span>
      </div>
      <ScrollArea className="h-[68vh] min-h-[420px] rounded-md border border-border bg-muted/20">
        <div className="space-y-5 p-2">
          {templateCategories.map((cat) => (
            <div key={cat}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{cat}</p>
              <div className="grid grid-cols-2 gap-2">
                {resumeTemplates
                  .filter((t) => t.category === cat)
                  .map((t) => {
                    const owned = isOwned(t.id);
                    const free = isFree(t.id);
                    const inCart = isInCart(t.id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleSelect(t.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSelect(t.id);
                          }
                        }}
                        className={cn(
                          "rounded-md p-2 text-left transition-all border relative cursor-pointer bg-card",
                          selected === t.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-transparent hover:border-border hover:bg-muted/50"
                        )}
                      >
                        <MiniPreview template={t} />
                        <div className="flex items-center justify-between mt-1.5">
                          <p className="text-[10px] font-medium text-foreground truncate">{t.name}</p>
                          {free ? (
                            <span className="text-[9px] text-score-high font-bold">FREE</span>
                          ) : owned ? (
                            <Check className="w-3 h-3 text-score-high" />
                          ) : (
                            <span className="flex items-center text-[9px] text-muted-foreground font-medium">
                              <IndianRupee className="w-2.5 h-2.5" />10
                            </span>
                          )}
                        </div>
                        {!owned && !free && (
                          <div className="mt-1.5">
                            {inCart ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 w-full text-[11px]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFromCart(t.id, t.name);
                                }}
                              >
                                Remove
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="h-7 w-full text-[11px]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(t.id, t.name);
                                }}
                              >
                                Add to Cart
                              </Button>
                            )}
                          </div>
                        )}
                        {!owned && !free && (
                          <div className="absolute top-1 right-1 rounded-full bg-background/90 border border-border p-0.5 pointer-events-none">
                            <Lock className="w-3 h-3 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="pt-2 border-t border-border bg-background sticky bottom-0">
        {cartCount > 0 ? (
          <Button size="sm" className="w-full" onClick={handleCheckout}>
            <CreditCard className="w-4 h-4 mr-2" /> Checkout Cart ({cartCount})
          </Button>
        ) : (
          <Button size="sm" className="w-full" variant="outline" disabled>
            <CreditCard className="w-4 h-4 mr-2" /> Checkout Cart
          </Button>
        )}
      </div>
    </div>
  );
};

export default TemplateSelector;
