import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, MessageSquare, ThumbsUp, Clock, CheckCircle2, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-2 md:border-l-4" 
          style={{ 
            borderLeftColor: isResolved ? 'hsl(var(--success))' : 'hsl(var(--destructive))' 
          }}>
      <CardContent className="p-3 md:p-6">
        <div className="flex items-start gap-2 md:gap-4">
          {/* Site Logo */}
          <Avatar className="h-12 w-12 md:h-16 md:w-16 border border-border md:border-2 flex-shrink-0">
            <AvatarImage 
              src={complaint.betting_sites?.logo_url} 
              alt={complaint.betting_sites?.name} 
            />
            <AvatarFallback className="text-xs md:text-base">
              {complaint.betting_sites?.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2 md:space-y-3 min-w-0">
            {/* Header with badges */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1.5 md:space-y-2 flex-1 min-w-0">
                <Link 
                  to={`/sikayetler/${complaint.id}`}
                  className="text-sm md:text-lg font-semibold hover:text-primary transition-colors line-clamp-2 block"
                >
                  {complaint.title}
                </Link>
                
                <div className="flex flex-wrap items-center gap-1 md:gap-2">
                  <Badge variant="outline" className="text-[10px] md:text-xs px-1.5 md:px-2.5 py-0 md:py-1 whitespace-nowrap">
                    {complaint.betting_sites?.name}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] md:text-xs px-1.5 md:px-2.5 py-0 md:py-1">
                    {categoryLabels[complaint.category]}
                  </Badge>
                  <Badge variant={getStatusVariant(complaint.status)} className="text-[10px] md:text-xs px-1.5 md:px-2.5 py-0 md:py-1">
                    {statusLabels[complaint.status]}
                  </Badge>
                  {hasOfficialResponse && (
                    <Badge variant="default" className="gap-1 text-[10px] md:text-xs px-1.5 md:px-2.5 py-0 md:py-1 hidden sm:flex">
                      <Shield className="w-2.5 h-2.5 md:w-3 md:h-3" />
                      <span className="hidden md:inline">Resmi Yanıt Var</span>
                      <span className="md:hidden">Resmi</span>
                    </Badge>
                  )}
                </div>
              </div>

              {isResolved && (
                <div className="flex items-center gap-0.5 md:gap-1 text-success flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-xs md:text-sm font-medium hidden sm:inline">Çözüldü</span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
              {complaint.description}
            </p>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">{format(new Date(complaint.created_at), 'dd MMM yyyy', { locale: tr })}</span>
                    <span className="sm:hidden">{format(new Date(complaint.created_at), 'dd/MM', { locale: tr })}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 md:w-4 md:h-4" />
                    <span>{complaint.response_count || 0}</span>
                    <span className="hidden md:inline">yanıt</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3 md:w-4 md:h-4" />
                    <span>{complaint.helpful_count || 0}</span>
                    <span className="hidden md:inline">faydalı</span>
                  </div>
                </div>

              <Button variant="ghost" size="sm" asChild className="h-8 md:h-9 text-xs md:text-sm w-full sm:w-auto">
                <Link to={`/sikayetler/${complaint.id}`}>
                  <span className="hidden sm:inline">Detayları Gör</span>
                  <span className="sm:hidden">Detay</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
