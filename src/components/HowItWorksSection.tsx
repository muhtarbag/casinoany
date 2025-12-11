import { Link } from "react-router-dom";
import { Search, MessageSquare, Gift, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

export const HowItWorksSection = () => {
  const scrollToSites = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const steps = [
    {
      icon: Search,
      title: "Karşılaştır",
      description: "100+ güvenilir bahis sitesini karşılaştır ve en iyisini bul",
      gradient: "from-primary/20 to-accent/20",
      iconGradient: "from-primary to-accent",
      action: scrollToSites,
      actionText: "Siteleri Karşılaştır",
      actionVariant: "default" as const,
      buttonClass: "bg-primary hover:bg-primary/90",
      badge: "Tarafsız ⚖️"
    },
    {
      icon: MessageSquare,
      title: "Yorum Yaz & Şikayet Yaz",
      description: "Deneyimlerini paylaş, topluluğa yorum ve şikayet yaz",
      gradient: "from-accent/20 to-primary/20",
      iconGradient: "from-accent to-primary",
      badge: "Topluluk ⭐",
      action: "/sikayetler/yeni",
      actionText: "Şikayet Yaz",
      actionVariant: "default" as const,
      featured: true
    },
    {
      icon: Gift,
      title: "Kazan",
      description: "Her yorumda ve şikayette puan kazan, VIP bonuslara eriş",
      gradient: "from-success/20 to-primary/20",
      iconGradient: "from-success to-primary",
      badge: "Ücretsiz 🎉",
      action: "/auth",
      actionText: "Üye Ol",
      actionVariant: "default" as const,
      buttonClass: "bg-success hover:bg-success/90 text-success-foreground"
    }
  ];

  return (
    <section className="relative container mx-auto px-4 py-12 md:py-16 overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-success/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      </div>

      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Nasıl Çalışır?
        </h2>
        <p className="text-muted-foreground text-sm md:text-lg">
          3 basit adımda güvenli bahis deneyimi
        </p>
      </div>

      {/* Mobile: Single Card Slider */}
      <div className="md:hidden space-y-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="relative">
              {/* Connecting Line (except for last item) */}
              {index !== steps.length - 1 && (
                <div className="absolute left-8 top-20 bottom-[-24px] w-0.5 bg-gradient-to-b from-primary/50 to-primary/10 z-0" />
              )}

              <div className={`relative bg-card/50 backdrop-blur-sm rounded-2xl p-5 border ${step.featured ? 'border-accent shadow-lg shadow-accent/5' : 'border-border/40'} flex gap-5 items-start`}>
                {/* Icon */}
                <div className={`relative z-10 w-16 h-16 bg-gradient-to-br ${step.iconGradient} rounded-2xl flex items-center justify-center shrink-0 shadow-lg mt-1`}>
                  <Icon className="w-7 h-7 text-primary-foreground" />
                  {/* Step Number Badge */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-background rounded-full border-2 border-primary flex items-center justify-center text-xs font-bold text-foreground">
                    {index + 1}
                  </div>
                </div>

                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold leading-tight">{step.title}</h3>
                    {step.badge && (
                      <span className="bg-gradient-to-r from-accent to-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ml-2 shrink-0">
                        {step.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {step.description}
                  </p>

                  {typeof step.action === 'function' ? (
                    <Button
                      variant={step.actionVariant}
                      size="sm"
                      className={`w-full shadow-sm ${step.featured ? 'bg-gradient-to-r from-accent to-primary' : step.buttonClass || ''}`}
                      onClick={step.action}
                    >
                      {step.actionText}
                      <ChevronRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  ) : (
                    <Button
                      asChild
                      variant={step.actionVariant}
                      size="sm"
                      className={`w-full shadow-sm ${step.featured ? 'bg-gradient-to-r from-accent to-primary' : step.buttonClass || ''}`}
                    >
                      <Link to={step.action}>
                        {step.actionText}
                        <ChevronRight className="w-3.5 h-3.5 ml-1.5" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: Grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className={`group relative bg-gradient-to-br ${step.gradient} rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl border ${step.featured ? 'border-2 border-accent md:-translate-y-2' : 'border-border/40'}`}>
              {step.badge && (
                <div className="absolute top-4 right-4">
                  <span className="bg-gradient-to-r from-accent to-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    {step.badge}
                  </span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10">
                <div className={`w-16 h-16 bg-gradient-to-br ${step.iconGradient} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform`}>
                  <Icon className="w-8 h-8 text-primary-foreground" />
                </div>

                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground mb-6">
                  {step.description}
                </p>

                {typeof step.action === 'function' ? (
                  <Button
                    variant={step.actionVariant}
                    className={`w-full group-hover:scale-105 transition-all ${step.featured ? 'bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 shadow-lg' : step.buttonClass || ''}`}
                    onClick={step.action}
                  >
                    {step.actionText}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    asChild
                    variant={step.actionVariant}
                    className={`w-full group-hover:scale-105 transition-all ${step.featured ? 'bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 shadow-lg' : step.buttonClass || ''}`}
                  >
                    <Link to={step.action}>
                      {step.actionText}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
