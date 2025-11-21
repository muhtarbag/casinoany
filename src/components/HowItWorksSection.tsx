import { Link } from "react-router-dom";
import { Search, MessageSquare, Gift, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";

export const HowItWorksSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const scrollToSites = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const steps = [
    {
      icon: Search,
      title: "Karşılaştır",
      description: "Yüzlerce bahis sitesini karşılaştır",
      gradient: "from-primary/20 to-accent/20",
      iconGradient: "from-primary to-accent",
      action: scrollToSites,
      actionText: "İncele",
      actionVariant: "default" as const,
      buttonClass: "bg-primary hover:bg-primary/90"
    },
    {
      icon: MessageSquare,
      title: "Paylaş",
      description: "Deneyimlerini topluluğa anlat",
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
      description: "VIP bonuslar ve ödüller kazan",
      gradient: "from-success/20 to-primary/20",
      iconGradient: "from-success to-primary",
      badge: "Ücretsiz 🎉",
      action: "/auth",
      actionText: "Üye Ol",
      actionVariant: "default" as const,
      buttonClass: "bg-success hover:bg-success/90 text-success-foreground"
    }
  ];

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // Swiped left
      setCurrentSlide((prev) => (prev + 1) % steps.length);
    }
    if (touchStart - touchEnd < -75) {
      // Swiped right
      setCurrentSlide((prev) => (prev - 1 + steps.length) % steps.length);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % steps.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
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
      <div className="md:hidden">
        <div 
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="w-full flex-shrink-0 px-2">
                  <div className={`relative bg-gradient-to-br ${step.gradient} backdrop-blur-sm rounded-2xl p-6 border ${step.featured ? 'border-accent' : 'border-border/40'} min-h-[280px] flex flex-col`}>
                    {step.badge && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-gradient-to-r from-accent to-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          {step.badge}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex flex-col items-center text-center flex-1">
                      <div className={`w-16 h-16 bg-gradient-to-br ${step.iconGradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                        <Icon className="w-8 h-8 text-primary-foreground" />
                      </div>
                      
                      <div className="mb-auto">
                        <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                        <p className="text-muted-foreground text-sm mb-6">
                          {step.description}
                        </p>
                      </div>
                      
                      {typeof step.action === 'function' ? (
                        <Button
                          variant={step.actionVariant}
                          size="lg"
                          className={`w-full shadow-lg ${step.featured ? 'bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90' : step.buttonClass || ''}`}
                          onClick={step.action}
                        >
                          {step.actionText}
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          asChild
                          variant={step.actionVariant}
                          size="lg"
                          className={`w-full shadow-lg ${step.featured ? 'bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90' : step.buttonClass || ''}`}
                        >
                          <Link to={step.action}>
                            {step.actionText}
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-8 bg-gradient-to-r from-primary to-accent' 
                  : 'w-2 bg-muted-foreground/30'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Swipe Indicator */}
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
          <div className="flex gap-1">
            <ChevronRight className="w-4 h-4 animate-pulse" />
            <span>Kaydır</span>
          </div>
        </div>
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
