
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator, Dna, RotateCcw, Plus, Trash2, TrendingUp, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BettingCalculator = () => {
    // Bonus Wagering State
    const [bonusAmount, setBonusAmount] = useState<number>(100);
    const [wageringReq, setWageringReq] = useState<number>(10);
    const [contribution, setContribution] = useState<number>(100);
    const [totalWagerNeeded, setTotalWagerNeeded] = useState<number>(0);

    // Odds Calculator State
    const [stake, setStake] = useState<number>(100);
    const [odds, setOdds] = useState<{ id: number; value: number }[]>([{ id: 1, value: 1.50 }, { id: 2, value: 1.80 }]);
    const [totalOdds, setTotalOdds] = useState<number>(0);
    const [potentialWin, setPotentialWin] = useState<number>(0);

    // Calculate Bonus Wagering
    useEffect(() => {
        const required = (bonusAmount * wageringReq) * (100 / contribution);
        setTotalWagerNeeded(required);
    }, [bonusAmount, wageringReq, contribution]);

    // Calculate Odds
    useEffect(() => {
        const total = odds.reduce((acc, odd) => acc * odd.value, 1);
        setTotalOdds(total);
        setPotentialWin(stake * total);
    }, [stake, odds]);

    const addOdd = () => {
        setOdds([...odds, { id: Date.now(), value: 1.50 }]);
    };

    const removeOdd = (id: number) => {
        setOdds(odds.filter(o => o.id !== id));
    };

    const updateOdd = (id: number, val: number) => {
        setOdds(odds.map(o => o.id === id ? { ...o, value: val } : o));
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center space-y-4 mb-8">
                <h2 className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Akıllı Bahis Hesaplayıcı
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Bonus çevrim şartlarını veya kupon kazancınızı saniyeler içinde hesaplayın.
                    Matematiği bize bırakın, siz stratejinize odaklanın.
                </p>
            </div>

            <Card className="border-2 border-border/50 shadow-2xl bg-card/50 backdrop-blur-xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary" />

                <CardContent className="p-0">
                    <Tabs defaultValue="bonus" className="w-full">
                        <div className="bg-muted/30 border-b border-border/50 p-2">
                            <TabsList className="grid w-full grid-cols-2 h-14 bg-background/50 p-1 gap-2 rounded-xl">
                                <TabsTrigger
                                    value="bonus"
                                    className="h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all rounded-lg text-base font-semibold gap-2"
                                >
                                    <Dna className="w-5 h-5" />
                                    Bonus Çevrim
                                </TabsTrigger>
                                <TabsTrigger
                                    value="odds"
                                    className="h-full data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg transition-all rounded-lg text-base font-semibold gap-2"
                                >
                                    <Calculator className="w-5 h-5" />
                                    Kupon Hesapla
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* BONUS TAB */}
                        <TabsContent value="bonus" className="p-6 md:p-8 space-y-8 m-0 focus-visible:ring-0">
                            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-base font-medium flex items-center gap-2">
                                            <Coins className="w-4 h-4 text-primary" />
                                            Bonus Miktarı (TL)
                                        </Label>
                                        <Input
                                            type="number"
                                            value={bonusAmount}
                                            onChange={(e) => setBonusAmount(Number(e.target.value))}
                                            className="h-12 text-lg tabular-nums bg-background/50 border-input/50 focus:border-primary transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-base font-medium flex items-center gap-2">
                                            <RotateCcw className="w-4 h-4 text-primary" />
                                            Çevrim Şartı (Katı)
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                value={wageringReq}
                                                onChange={(e) => setWageringReq(Number(e.target.value))}
                                                className="h-12 text-lg tabular-nums pl-12 bg-background/50 border-input/50 focus:border-primary transition-all"
                                            />
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">x</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Genellikle 10x ile 40x arasında değişir.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-base font-medium">% Oyun Katkısı</Label>
                                        <Input
                                            type="number"
                                            value={contribution}
                                            onChange={(e) => setContribution(Number(e.target.value))}
                                            className="h-12 text-lg tabular-nums bg-background/50 border-input/50 focus:border-primary transition-all"
                                        />
                                        <p className="text-xs text-muted-foreground">Slotlar genelde %100, Canlı Casino %10-20 katkı sağlar.</p>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center space-y-6 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent rounded-3xl p-6 md:p-8 border border-primary/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />

                                    <div className="relative z-10 text-center space-y-2">
                                        <h3 className="text-muted-foreground font-medium uppercase tracking-wider text-sm">
                                            Toplam Yapılması Gereken Bahis
                                        </h3>
                                        <div className="text-4xl md:text-5xl font-display font-bold text-primary tabular-nums tracking-tight">
                                            {totalWagerNeeded.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL
                                        </div>
                                    </div>

                                    <div className="relative z-10 bg-background/60 backdrop-blur-md rounded-2xl p-4 border border-primary/10 space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Bonus:</span>
                                            <span className="font-semibold">{bonusAmount} TL</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Şart:</span>
                                            <span className="font-semibold">{wageringReq} Katı</span>
                                        </div>
                                        <div className="h-px bg-border/50" />
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Hesabınızdan para çekebilmek için toplamda <strong className="text-primary">{totalWagerNeeded.toLocaleString('tr-TR')} TL</strong> değerinde oyun oynamanız gerekmektedir.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* ODDS TAB */}
                        <TabsContent value="odds" className="p-6 md:p-8 space-y-8 m-0 focus-visible:ring-0">
                            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-base font-medium flex items-center gap-2">
                                            <Coins className="w-4 h-4 text-accent" />
                                            Bahis Miktarı (TL)
                                        </Label>
                                        <Input
                                            type="number"
                                            value={stake}
                                            onChange={(e) => setStake(Number(e.target.value))}
                                            className="h-12 text-lg tabular-nums bg-background/50 border-input/50 focus:border-accent transition-all"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-base font-medium">Maç Oranları</Label>
                                            <Button onClick={addOdd} size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                                                <Plus className="w-3.5 h-3.5" /> Maç Ekle
                                            </Button>
                                        </div>

                                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                            {odds.map((odd, idx) => (
                                                <div key={odd.id} className="flex items-center gap-3 animate-fade-in-up">
                                                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-bold shrink-0">
                                                        {idx + 1}
                                                    </span>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={odd.value}
                                                        onChange={(e) => updateOdd(odd.id, Number(e.target.value))}
                                                        className="h-10 text-lg tabular-nums bg-background/50 border-input/50 focus:border-accent transition-all"
                                                    />
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => removeOdd(odd.id)}
                                                        className="h-10 w-10 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0"
                                                        disabled={odds.length <= 1}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center space-y-6 bg-gradient-to-br from-accent/5 via-accent/10 to-transparent rounded-3xl p-6 md:p-8 border border-accent/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-[60px] rounded-full pointer-events-none" />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1 p-4 bg-background/40 rounded-2xl border border-accent/10">
                                            <h3 className="text-muted-foreground text-xs font-medium uppercase">Toplam Oran</h3>
                                            <div className="text-2xl font-bold text-foreground tabular-nums">
                                                {totalOdds.toFixed(2)}
                                            </div>
                                        </div>
                                        <div className="space-y-1 p-4 bg-background/40 rounded-2xl border border-accent/10">
                                            <h3 className="text-muted-foreground text-xs font-medium uppercase">Bahis</h3>
                                            <div className="text-2xl font-bold text-foreground tabular-nums">
                                                {stake} TL
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative z-10 text-center space-y-2 pt-2">
                                        <h3 className="text-muted-foreground font-medium uppercase tracking-wider text-sm flex items-center justify-center gap-2">
                                            <TrendingUp className="w-4 h-4" />
                                            Tahmini Kazanç
                                        </h3>
                                        <div className="text-4xl md:text-5xl font-display font-bold text-accent tabular-nums tracking-tight drop-shadow-sm">
                                            {potentialWin.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} TL
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Disclaimer */}
            <p className="text-center text-xs text-muted-foreground/60 max-w-xl mx-auto">
                * Bu araçlar bilgilendirme amaçlıdır. Bahis sitelerinin kuralları farklılık gösterebilir.
                Lütfen oynadığınız sitenin şartlarını kontrol ediniz.
            </p>
        </div>
    );
};
