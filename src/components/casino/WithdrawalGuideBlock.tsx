import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

interface WithdrawalGuideBlockProps {
  withdrawalGuide?: string;
}

export const WithdrawalGuideBlock = ({ withdrawalGuide }: WithdrawalGuideBlockProps) => {
  if (!withdrawalGuide) return null;

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Para Çekme Rehberi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: withdrawalGuide }}
        />
      </CardContent>
    </Card>
  );
};
