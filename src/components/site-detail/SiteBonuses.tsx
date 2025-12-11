
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import { useState } from "react";

interface SiteBonusesProps {
    bonusOffers: any[];
    onAffiliateClick: () => void;
}

export function SiteBonuses({ bonusOffers, onAffiliateClick }: SiteBonusesProps) {
    const [expandedTerms, setExpandedTerms] = useState<Record<string, boolean>>({});

    if (!bonusOffers || bonusOffers.length === 0) return null;

    return (
        <div className="space-y-6">
            {bonusOffers.map((bonus: any, index: number) => (
                <div
                    key={bonus.id}
                    className="group relative animate-fade-in hover-scale"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <CardContent className="p-0">
                            <div className="flex flex-col">
                                {/* Image Section */}
                                {bonus.image_url && (
                                    <div className="relative w-full h-48 sm:h-64 lg:h-48 overflow-hidden flex-shrink-0">
                                        <img
                                            src={bonus.image_url}
                                            alt={bonus.title}
                                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                )}

                                {/* Content Section */}
                                <div className="flex-1 p-6 md:p-8 space-y-6">
                                    {/* Header */}
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <h3 className="text-2xl md:text-3xl font-bold leading-tight group-hover:text-primary transition-colors duration-300">
                                                {bonus.title}
                                            </h3>
                                            <Badge className="bg-gradient-to-r from-gold to-gold/90 text-gold-foreground shadow-md px-4 py-2 text-base md:text-lg font-bold whitespace-nowrap flex-shrink-0">
                                                {bonus.bonus_amount}
                                            </Badge>
                                        </div>

                                        {/* Bonus Type */}
                                        {bonus.bonus_type && (
                                            <div>
                                                <Badge variant="secondary" className="px-3 py-1.5 text-sm font-semibold">
                                                    {bonus.bonus_type === 'no_deposit' && '🎁 Deneme Bonusu'}
                                                    {bonus.bonus_type === 'welcome' && '👋 Hoş Geldin'}
                                                    {bonus.bonus_type === 'deposit' && '💰 Yatırım Bonusu'}
                                                    {bonus.bonus_type === 'free_spins' && '🎰 Free Spin'}
                                                    {bonus.bonus_type === 'reload' && '🔄 Reload Bonusu'}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info Grid */}
                                    {(bonus.wagering_requirement || bonus.eligibility || bonus.validity_period) && (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {bonus.wagering_requirement && (
                                                <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 p-3 border border-border/50 group/card hover:border-primary/30 transition-colors">
                                                    <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-full -mr-6 -mt-6"></div>
                                                    <div className="relative">
                                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Çevrim Şartı</p>
                                                        <p className="text-sm font-bold text-foreground">{bonus.wagering_requirement}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {bonus.eligibility && (
                                                <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 p-3 border border-border/50 group/card hover:border-primary/30 transition-colors">
                                                    <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-full -mr-6 -mt-6"></div>
                                                    <div className="relative">
                                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Kimler İçin</p>
                                                        <p className="text-sm font-bold text-foreground">{bonus.eligibility}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {bonus.validity_period && (
                                                <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 p-3 border border-border/50 group/card hover:border-primary/30 transition-colors">
                                                    <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-full -mr-6 -mt-6"></div>
                                                    <div className="relative">
                                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Geçerlilik</p>
                                                        <p className="text-sm font-bold text-foreground">{bonus.validity_period}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Terms */}
                                    {bonus.terms && (
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-lg"></div>
                                            <div className="relative bg-muted/30 backdrop-blur-sm rounded-lg p-4 border border-border/50">
                                                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                                                    {bonus.terms.length > 300 && !expandedTerms[bonus.id] ? (
                                                        <>
                                                            {bonus.terms.substring(0, 300)}...
                                                            <button
                                                                onClick={() => setExpandedTerms(prev => ({ ...prev, [bonus.id]: true }))}
                                                                className="text-primary hover:underline ml-1 font-semibold"
                                                            >
                                                                Devamını Oku
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {bonus.terms}
                                                            {bonus.terms.length > 300 && (
                                                                <button
                                                                    onClick={() => setExpandedTerms(prev => ({ ...prev, [bonus.id]: false }))}
                                                                    className="text-primary hover:underline ml-1 font-semibold"
                                                                >
                                                                    Daha Az Göster
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* CTA Button */}
                                    <Button
                                        onClick={onAffiliateClick}
                                        size="lg"
                                        className="w-full sm:w-auto relative overflow-hidden group/btn bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></span>
                                        <span className="relative flex items-center gap-2 font-bold">
                                            <Gift className="w-5 h-5" />
                                            Bonusu Hemen Talep Et
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ))}
        </div>
    );
}
