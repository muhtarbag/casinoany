import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
}

interface ReviewEditDialogProps {
  review: Review | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (reviewId: string, data: { rating: number; title: string; comment: string }) => void;
  isSaving?: boolean;
}

export function ReviewEditDialog({ review, isOpen, onClose, onSave, isSaving = false }: ReviewEditDialogProps) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (review) {
      setRating(review.rating);
      setTitle(review.title);
      setComment(review.comment);
    }
  }, [review]);

  const handleSave = () => {
    if (review) {
      onSave(review.id, { rating, title, comment });
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form after close
    setTimeout(() => {
      setRating(5);
      setTitle("");
      setComment("");
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Yorumu Düzenle</DialogTitle>
          <DialogDescription>
            Yorum bilgilerini düzenleyin ve kaydedin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Puan</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-title">Başlık</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Yorum başlığı"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-comment">Yorum</Label>
            <Textarea
              id="edit-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Yorum içeriği"
              rows={5}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            İptal
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
