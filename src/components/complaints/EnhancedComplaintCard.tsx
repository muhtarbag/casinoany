import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, ThumbsUp, Clock, CheckCircle2, Shield, TrendingUp, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface EnhancedComplaintCardProps {
  complaint: any;
  categoryLabels: Record<string, string>;
  statusLabels: Record<string, string>;
  getStatusVariant: (status: string) => any;
}

export const EnhancedComplaintCard = ({
  complaint,
  categoryLabels,
  statusLabels,
  getStatusVariant,
}: EnhancedComplaintCardProps) => {
  const hasOfficialResponse = complaint.response_count > 0;
  const isResolved = complaint.status === 'resolved';
  const isHighPriority = complaint.helpful_count >= 5;

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:shadow-xl hover:border-primary/40",
        "border",
        isResolved && "bg-success/[0.02] border-success/20",
        !isResolved && isHighPriority && "bg-destructive/[0.02] border-destructive/20",
      )}
    >
      {/* Subtle Status Indicator */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1 transition-all",
        isResolved && "bg-success",
        !isResolved && isHighPriority && "bg-destructive",
        !isResolved && !isHighPriority && "bg-primary/40"
      )} />

      <CardContent className="p-4 md:p-6">
        <div className="flex gap-4 md:gap-6">
          {/* Logo Section - Prominent but Not Dominant */}
          <div className="relative flex-shrink-0">
            <div className={cn(
              "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity",
              isResolved ? "bg-success" : "bg-primary"
            )} />
            <Avatar className="relative h-20 w-20 md:h-24 md:w-24 ring-2 ring-border/50 group-hover:ring-primary/50 transition-all rounded-xl shadow-md">
              <AvatarImage 
                src={complaint.betting_sites?.logo_url} 
                alt={complaint.betting_sites?.name}
                className="object-contain p-2.5"
              />
              <AvatarFallback className="text-xl md:text-2xl font-bold bg-gradient-to-br from-muted to-muted/50 rounded-xl">
                {complaint.betting_sites?.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            
            {/* Priority Badge */}
            {isHighPriority && (
              <div className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            )}
            
            {/* Resolution Badge */}
            {isResolved && (
              <div className="absolute -bottom-1.5 -right-1.5 bg-success text-success-foreground rounded-full p-1 shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Header with Title and Status */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <Link 
                  to={`/sikayetler/${complaint.slug || complaint.id}`}
                  className="text-lg md:text-xl font-bold hover:text-primary transition-colors line-clamp-2 leading-tight flex-1"
                >
                  {complaint.title}
                </Link>
                
                {isResolved && (
                  <Badge variant="outline" className="border-success text-success font-semibold whitespace-nowrap">
                    ✓ Çözüldü
                  </Badge>
                )}
              </div>
              
              {/* Site Name - Prominent */}
              <div className="flex items-center gap-2">
                <span className="text-sm md:text-base font-semibold text-primary">
                  {complaint.betting_sites?.name}
                </span>
                {hasOfficialResponse && (
                  <Badge variant="default" className="gap-1 text-xs bg-primary/90 px-2 py-0.5">
                    <Shield className="w-3 h-3" />
                    Resmi Yanıt
                  </Badge>
                )}
              </div>
              
              {/* Category and Status Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary" className="text-xs px-2.5 py-0.5">
                  {categoryLabels[complaint.category]}
                </Badge>
                <Badge variant={getStatusVariant(complaint.status)} className="text-xs px-2.5 py-0.5">
                  {statusLabels[complaint.status]}
                </Badge>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm md:text-base text-muted-foreground line-clamp-2 leading-relaxed">
              {complaint.description}
            </p>

            {/* Footer Metadata */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{format(new Date(complaint.created_at), 'dd MMM yyyy', { locale: tr })}</span>
                </div>
                
                <div className="flex items-center gap-1.5 hover:text-accent transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-medium">{complaint.response_count || 0}</span>
                </div>
                
                <div className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="font-medium">{complaint.helpful_count || 0}</span>
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="sm" 
                asChild 
                className="gap-1.5 font-medium hover:bg-primary/10 hover:text-primary"
              >
                <Link to={`/sikayetler/${complaint.slug || complaint.id}`}>
                  <span className="hidden sm:inline">Detaylar</span>
                  <span className="sm:hidden">Gör</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
