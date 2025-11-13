import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from "lucide-react";

interface LoginGuideBlockProps {
  loginGuide?: string;
}

export const LoginGuideBlock = ({ loginGuide }: LoginGuideBlockProps) => {
  if (!loginGuide) return null;

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <LogIn className="w-5 h-5" />
          Giriş Rehberi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: loginGuide }}
        />
      </CardContent>
    </Card>
  );
};
