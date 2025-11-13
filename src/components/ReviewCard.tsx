import { Star, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    title: string;
    comment: string;
    created_at: string;
    name?: string;
    email?: string;
    profiles?: {
      username: string;
      avatar_url: string | null;
    };
  };
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const username = review.name || review.profiles?.username || "Anonim";
  const avatarUrl = review.profiles?.avatar_url;
  const date = new Date(review.created_at).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback>
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{username}</p>
              <p className="text-sm text-muted-foreground">{date}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <h4 className="font-semibold mb-2">{review.title}</h4>
        <p className="text-muted-foreground">{review.comment}</p>
      </CardContent>
    </Card>
  );
}
