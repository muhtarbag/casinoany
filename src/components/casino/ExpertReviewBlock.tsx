import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface ExpertReviewBlockProps {
  expertReview?: string;
}

export const ExpertReviewBlock = ({ expertReview }: ExpertReviewBlockProps) => {
  if (!expertReview) return null;

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Detaylı İnceleme
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: expertReview }}
        />
      </CardContent>
    </Card>
  );
};
