import { AIAssistant as SEOAssistant } from '@/components/AIAssistant';
import { AIChatbot } from '@/components/AIChatbot';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, BarChart3 } from 'lucide-react';

export default function AIAssistant() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Asistan</h1>
          <p className="text-muted-foreground mt-1">
            Yapay zeka destekli asistan ve SEO analizi
          </p>
        </div>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Sohbet
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            SEO Analizi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          <AIChatbot />
        </TabsContent>

        <TabsContent value="seo" className="mt-6">
          <SEOAssistant />
        </TabsContent>
      </Tabs>
    </div>
  );
}
