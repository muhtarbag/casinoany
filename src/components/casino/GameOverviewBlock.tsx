import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2 } from "lucide-react";

interface GameOverviewBlockProps {
  gameCategories?: Record<string, string>;
}

export const GameOverviewBlock = ({ gameCategories }: GameOverviewBlockProps) => {
  if (!gameCategories || Object.keys(gameCategories).length === 0) return null;

  const categoryIcons: Record<string, string> = {
    slot: "🎰",
    canlı: "🎲",
    spor: "⚽",
    poker: "🃏",
    rulet: "🎡",
    blackjack: "🂡",
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Gamepad2 className="w-5 h-5" />
          Oyun Çeşitleri
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(gameCategories).map(([category, description]) => (
            <div
              key={category}
              className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">
                  {categoryIcons[category.toLowerCase()] || "🎮"}
                </span>
                <h3 className="font-semibold capitalize">{category}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
