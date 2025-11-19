import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "./RichTextEditor";
import { Plus, X } from "lucide-react";

interface GameCategory {
  [key: string]: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface CasinoContentEditorProps {
  pros: string[];
  setPros: (pros: string[]) => void;
  cons: string[];
  setCons: (cons: string[]) => void;
  verdict: string;
  setVerdict: (verdict: string) => void;
  expertReview: string;
  setExpertReview: (expertReview: string) => void;
  gameCategories: GameCategory;
  setGameCategories: (gameCategories: GameCategory) => void;
  loginGuide: string;
  setLoginGuide: (loginGuide: string) => void;
  withdrawalGuide: string;
  setWithdrawalGuide: (withdrawalGuide: string) => void;
  faq: FAQ[];
  setFaq: (faq: FAQ[]) => void;
}

export const CasinoContentEditor = ({
  pros,
  setPros,
  cons,
  setCons,
  verdict,
  setVerdict,
  expertReview,
  setExpertReview,
  gameCategories,
  setGameCategories,
  loginGuide,
  setLoginGuide,
  withdrawalGuide,
  setWithdrawalGuide,
  faq,
  setFaq,
}: CasinoContentEditorProps) => {
  const addPro = () => setPros([...pros, ""]);
  const removePro = (index: number) => setPros(pros.filter((_, i) => i !== index));
  const updatePro = (index: number, value: string) => {
    const newPros = [...pros];
    newPros[index] = value;
    setPros(newPros);
  };

  const addCon = () => setCons([...cons, ""]);
  const removeCon = (index: number) => setCons(cons.filter((_, i) => i !== index));
  const updateCon = (index: number, value: string) => {
    const newCons = [...cons];
    newCons[index] = value;
    setCons(newCons);
  };

  const addGameCategory = () => {
    setGameCategories({ ...gameCategories, "": "" });
  };

  const removeGameCategory = (key: string) => {
    const newCategories = { ...gameCategories };
    delete newCategories[key];
    setGameCategories(newCategories);
  };

  const updateGameCategory = (oldKey: string, newKey: string, value: string) => {
    const newCategories = { ...gameCategories };
    if (oldKey !== newKey && oldKey !== "") {
      delete newCategories[oldKey];
    }
    newCategories[newKey] = value;
    setGameCategories(newCategories);
  };

  const addFaq = () => setFaq([...faq, { question: "", answer: "" }]);
  const removeFaq = (index: number) => setFaq(faq.filter((_, i) => i !== index));
  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaq = [...faq];
    newFaq[index][field] = value;
    setFaq(newFaq);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Casino İçerik Yönetimi</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {/* Pros & Cons */}
          <AccordionItem value="pros-cons">
            <AccordionTrigger>Artılar & Eksiler</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-green-600">Artılar</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addPro}>
                    <Plus className="w-4 h-4 mr-1" />
                    Ekle
                  </Button>
                </div>
                {pros.map((pro, index) => (
                  <div key={`pro-${index}`} className="flex gap-2">
                    <Input
                      value={pro}
                      onChange={(e) => updatePro(index, e.target.value)}
                      placeholder="Örn: Hızlı para çekme"
                    />
                    <Button type="button" size="icon" variant="ghost" onClick={() => removePro(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-red-600">Eksiler</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addCon}>
                    <Plus className="w-4 h-4 mr-1" />
                    Ekle
                  </Button>
                </div>
                {cons.map((con, index) => (
                  <div key={`con-${index}`} className="flex gap-2">
                    <Input
                      value={con}
                      onChange={(e) => updateCon(index, e.target.value)}
                      placeholder="Örn: Yüksek bahis şartları"
                    />
                    <Button type="button" size="icon" variant="ghost" onClick={() => removeCon(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Verdict */}
          <AccordionItem value="verdict">
            <AccordionTrigger>Uzman Görüşü</AccordionTrigger>
            <AccordionContent>
              <RichTextEditor
                value={verdict}
                onChange={setVerdict}
                placeholder="Uzman görüşünüzü yazın..."
              />
            </AccordionContent>
          </AccordionItem>

          {/* Expert Review */}
          <AccordionItem value="expert-review">
            <AccordionTrigger>Detaylı İnceleme</AccordionTrigger>
            <AccordionContent>
              <RichTextEditor
                value={expertReview}
                onChange={setExpertReview}
                placeholder="Detaylı inceleme yazın..."
              />
            </AccordionContent>
          </AccordionItem>

          {/* Game Categories */}
          <AccordionItem value="game-categories">
            <AccordionTrigger>Oyun Çeşitleri</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <Button type="button" size="sm" variant="outline" onClick={addGameCategory}>
                <Plus className="w-4 h-4 mr-1" />
                Kategori Ekle
              </Button>
              {Object.entries(gameCategories).map(([key, value], index) => (
                <div key={`game-cat-${key}-${index}`} className="grid grid-cols-2 gap-2">
                  <Input
                    value={key}
                    onChange={(e) => updateGameCategory(key, e.target.value, value)}
                    placeholder="Kategori (örn: slot)"
                  />
                  <div className="flex gap-2">
                    <Input
                      value={value}
                      onChange={(e) => updateGameCategory(key, key, e.target.value)}
                      placeholder="Açıklama (örn: 500+ slot oyunu)"
                    />
                    <Button type="button" size="icon" variant="ghost" onClick={() => removeGameCategory(key)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Login Guide */}
          <AccordionItem value="login-guide">
            <AccordionTrigger>Giriş Rehberi</AccordionTrigger>
            <AccordionContent>
              <RichTextEditor
                value={loginGuide}
                onChange={setLoginGuide}
                placeholder="Giriş rehberi yazın..."
              />
            </AccordionContent>
          </AccordionItem>

          {/* Withdrawal Guide */}
          <AccordionItem value="withdrawal-guide">
            <AccordionTrigger>Para Çekme Rehberi</AccordionTrigger>
            <AccordionContent>
              <RichTextEditor
                value={withdrawalGuide}
                onChange={setWithdrawalGuide}
                placeholder="Para çekme rehberi yazın..."
              />
            </AccordionContent>
          </AccordionItem>

          {/* FAQ */}
          <AccordionItem value="faq">
            <AccordionTrigger>Sıkça Sorulan Sorular</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <Button type="button" size="sm" variant="outline" onClick={addFaq}>
                <Plus className="w-4 h-4 mr-1" />
                Soru Ekle
              </Button>
              {faq.map((item, index) => (
                <div key={`faq-${index}`} className="space-y-2 p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <Label>Soru {index + 1}</Label>
                    <Button type="button" size="icon" variant="ghost" onClick={() => removeFaq(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Input
                    value={item.question}
                    onChange={(e) => updateFaq(index, 'question', e.target.value)}
                    placeholder="Soru"
                  />
                  <Textarea
                    value={item.answer}
                    onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                    placeholder="Cevap"
                    rows={3}
                  />
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};
