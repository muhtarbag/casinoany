import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Linkedin, Link2, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SocialShareButtonsProps {
  title: string;
  description?: string;
}

export const SocialShareButtons = ({ title, description }: SocialShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const url = window.location.href;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || title);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: "Bağlantı kopyalandı!", description: "Link panoya kopyalandı." });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ 
        title: "Hata", 
        description: "Link kopyalanamadı.", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground mr-2">Paylaş:</span>
      
      <Button
        size="sm"
        variant="outline"
        onClick={() => window.open(shareLinks.facebook, '_blank')}
        className="gap-2"
      >
        <Facebook className="w-4 h-4" />
        Facebook
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => window.open(shareLinks.twitter, '_blank')}
        className="gap-2"
      >
        <Twitter className="w-4 h-4" />
        Twitter
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => window.open(shareLinks.linkedin, '_blank')}
        className="gap-2"
      >
        <Linkedin className="w-4 h-4" />
        LinkedIn
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={copyToClipboard}
        className="gap-2"
      >
        {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
        {copied ? "Kopyalandı" : "Linki Kopyala"}
      </Button>
    </div>
  );
};
