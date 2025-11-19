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
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4" 
          style={{ 
            borderLeftColor: isResolved ? 'hsl(var(--success))' : 'hsl(var(--destructive))' 
          }}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Site Logo */}
          <Avatar className="h-16 w-16 border-2 border-border">
            <AvatarImage 
              src={complaint.betting_sites?.logo_url} 
              alt={complaint.betting_sites?.name} 
            />
            <AvatarFallback>
              {complaint.betting_sites?.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            {/* Header with badges */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-2 flex-1">
                <Link 
                  to={`/sikayetler/${complaint.id}`}
                  className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2"
                >
                  {complaint.title}
                </Link>
                
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {complaint.betting_sites?.name}
                  </Badge>
                  <Badge variant="secondary">
                    {categoryLabels[complaint.category]}
                  </Badge>
                  <Badge variant={getStatusVariant(complaint.status)}>
                    {statusLabels[complaint.status]}
                  </Badge>
                  {hasOfficialResponse && (
                    <Badge variant="default" className="gap-1">
                      <Shield className="w-3 h-3" />
                      Resmi Yanıt Var
                    </Badge>
                  )}
                </div>
              </div>

              {isResolved && (
                <div className="flex items-center gap-1 text-success">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Çözüldü</span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground line-clamp-2">
              {complaint.description}
            </p>

            {/* Footer with stats */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {format(new Date(complaint.created_at), 'dd MMM yyyy', { locale: tr })}
                </div>
                
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{complaint.response_count || 0} yanıt</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{complaint.helpful_count || 0} faydalı</span>
                </div>
              </div>

              <Button variant="ghost" size="sm" asChild>
                <Link to={`/sikayetler/${complaint.id}`}>
                  Detayları Gör
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
