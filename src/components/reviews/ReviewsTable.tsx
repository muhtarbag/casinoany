import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, Edit2, Trash2, Star } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface BettingSite {
  id: string;
  name: string;
}

interface Profile {
  id: string;
  username: string;
}

interface Review {
  id: string;
  site_id: string;
  user_id: string | null;
  name: string | null;
  email: string | null;
  rating: number;
  title: string;
  comment: string;
  is_approved: boolean;
  created_at: string;
  updated_at?: string;
  betting_sites?: BettingSite | null;
  profiles?: Profile | null;
}

interface ReviewsTableProps {
  reviews: Review[];
  selectedReviews: Set<string>;
  onToggleSelection: (reviewId: string) => void;
  onToggleSelectAll: () => void;
  onApprove: (reviewId: string) => void;
  onReject: (reviewId: string) => void;
  onEdit: (review: Review) => void;
  onDelete: (reviewId: string) => void;
  getSiteName: (review: Review) => string;
  getUserDisplayName: (review: Review) => string;
  isLoading?: boolean;
}

export function ReviewsTable({
  reviews,
  selectedReviews,
  onToggleSelection,
  onToggleSelectAll,
  onApprove,
  onReject,
  onEdit,
  onDelete,
  getSiteName,
  getUserDisplayName,
  isLoading = false
}: ReviewsTableProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted"
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Yorumlar yükleniyor...
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Henüz yorum bulunmuyor
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedReviews.size === reviews.length && reviews.length > 0}
                onCheckedChange={onToggleSelectAll}
              />
            </TableHead>
            <TableHead>Site</TableHead>
            <TableHead>Kullanıcı</TableHead>
            <TableHead>Puan</TableHead>
            <TableHead>Başlık</TableHead>
            <TableHead>Yorum</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Tarih</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review.id}>
              <TableCell>
                <Checkbox
                  checked={selectedReviews.has(review.id)}
                  onCheckedChange={() => onToggleSelection(review.id)}
                />
              </TableCell>
              <TableCell className="font-medium">
                {getSiteName(review)}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{getUserDisplayName(review)}</span>
                  {review.email && (
                    <span className="text-xs text-muted-foreground">{review.email}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-0.5">
                  {renderStars(review.rating)}
                </div>
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {review.title}
              </TableCell>
              <TableCell className="max-w-[300px] truncate">
                {review.comment}
              </TableCell>
              <TableCell>
                <Badge variant={review.is_approved ? "default" : "secondary"}>
                  {review.is_approved ? "Onaylandı" : "Beklemede"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(review.created_at), "dd MMM yyyy", { locale: tr })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {!review.is_approved && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onApprove(review.id)}
                      title="Onayla"
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                  )}
                  {review.is_approved && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onReject(review.id)}
                      title="Reddet"
                    >
                      <X className="h-4 w-4 text-orange-600" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(review)}
                    title="Düzenle"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(review.id)}
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
