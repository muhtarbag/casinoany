import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, MessageSquare, ThumbsUp, Clock, CheckCircle2, Shield, TrendingUp } from 'lucide-react';
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
        "group relative overflow-hidden transition-all duration-500",
        "hover:shadow-2xl hover:scale-[1.01] hover:-translate-y-1",
        "border-2",
        isResolved && "border-success/30 bg-success/5",
        !isResolved && isHighPriority && "border-destructive/30 bg-destructive/5",
        !isResolved && !isHighPriority && "border-border hover:border-primary/30"
      )}
    >
      {/* Gradient Overlay */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
        isResolved 
          ? "bg-gradient-to-br from-success/10 via-transparent to-transparent" 
          : "bg-gradient-to-br from-primary/10 via-accent/5 to-transparent"
      )} />

      {/* Status Accent Bar */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1.5 md:w-2 transition-all duration-300",
        isResolved && "bg-gradient-to-b from-success via-success/70 to-success/50",
        !isResolved && isHighPriority && "bg-gradient-to-b from-destructive via-destructive/70 to-destructive/50",
        !isResolved && !isHighPriority && "bg-gradient-to-b from-primary via-primary/70 to-primary/50"
      )} />

      <CardContent className="p-4 md:p-8 relative">
        <div className="flex flex-col gap-4 md:gap-6">
          {/* Enhanced Logo - Top Section */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className={cn(
                "absolute inset-0 rounded-2xl blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500",
                isResolved ? "bg-success" : "bg-primary"
              )} />
              <Avatar className="relative h-40 w-40 md:h-48 md:w-48 lg:h-56 lg:w-56 ring-4 md:ring-6 ring-border group-hover:ring-primary/50 transition-all duration-300 rounded-2xl shadow-2xl">
                <AvatarImage 
                  src={complaint.betting_sites?.logo_url} 
                  alt={complaint.betting_sites?.name}
                  className="object-contain p-4 md:p-6"
                />
                <AvatarFallback className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl">
                  {complaint.betting_sites?.name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              {isHighPriority && (
                <div className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-2 md:p-3 shadow-lg animate-pulse">
                  <TrendingUp className="w-4 h-4 md:w-6 md:h-6" />
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-3 md:space-y-4">
            {/* Header Section */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 md:space-y-3 flex-1 min-w-0">
                <Link 
                  to={`/sikayetler/${complaint.slug || complaint.id}`}
                  className="text-base md:text-xl lg:text-2xl font-bold hover:text-primary transition-colors line-clamp-2 block leading-tight group-hover:underline decoration-2 underline-offset-4"
                >
                  {complaint.title}
                </Link>
                
                {/* Enhanced Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className="text-xs md:text-sm px-3 md:px-4 py-1 md:py-1.5 font-semibold border-2 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {complaint.betting_sites?.name}
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className="text-xs md:text-sm px-3 md:px-4 py-1 md:py-1.5 font-medium shadow-sm"
                  >
                    {categoryLabels[complaint.category]}
                  </Badge>
                  <Badge 
                    variant={getStatusVariant(complaint.status)} 
                    className="text-xs md:text-sm px-3 md:px-4 py-1 md:py-1.5 font-medium shadow-sm"
                  >
                    {statusLabels[complaint.status]}
                  </Badge>
                  {hasOfficialResponse && (
                    <Badge 
                      variant="default" 
                      className="gap-1.5 text-xs md:text-sm px-3 md:px-4 py-1 md:py-1.5 font-medium bg-gradient-to-r from-primary to-primary/80 shadow-lg"
                    >
                      <Shield className="w-3 h-3 md:w-4 md:h-4" />
                      <span>Resmi Yanıt</span>
                    </Badge>
                  )}
                </div>
              </div>

              {isResolved && (
                <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-success/10 border-2 border-success/30 flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-success" />
                  <span className="text-xs font-bold text-success whitespace-nowrap">Çözüldü</span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-sm md:text-base text-muted-foreground line-clamp-2 leading-relaxed">
              {complaint.description}
            </p>

            {/* Footer Section */}
            <div className="flex items-center justify-between pt-3 md:pt-4 border-t-2 border-border/50">
              <div className="flex items-center gap-3 md:gap-6 text-sm md:text-base flex-wrap">
                <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Clock className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="font-medium">
                    {format(new Date(complaint.created_at), 'dd MMM yyyy', { locale: tr })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors">
                  <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="font-semibold">{complaint.response_count || 0}</span>
                  <span className="hidden md:inline font-medium">yanıt</span>
                </div>
                
                <div className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                  <ThumbsUp className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="font-semibold">{complaint.helpful_count || 0}</span>
                  <span className="hidden md:inline font-medium">faydalı</span>
                </div>
              </div>

              <Button 
                variant="default" 
                size="sm" 
                asChild 
                className="h-8 md:h-9 px-4 md:px-5 font-medium shadow-md hover:shadow-lg transition-all group/btn"
              >
                <Link to={`/sikayetler/${complaint.slug || complaint.id}`}>
                  <span>Detayları Gör</span>
                  <svg 
                    className="w-3 h-3 ml-1.5 transition-transform group-hover/btn:translate-x-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
