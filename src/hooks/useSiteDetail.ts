
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { analytics } from "@/lib/analytics";

export interface Review {
    id: string;
    site_id: string;
    user_id: string;
    rating: number;
    title: string;
    comment: string;
    is_approved: boolean;
    created_at: string;
    updated_at: string;
    type?: 'review';
    profiles?: {
        username: string;
        avatar_url: string | null;
    };
}

export function useSiteDetail(slug?: string, id?: string) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { isFavorite: checkFavorite, toggleFavorite, isToggling } = useFavorites();
    const [viewTracked, setViewTracked] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    // 1. Fetch Site Data
    const { data: site, isLoading: siteLoading, error: siteError } = useQuery({
        queryKey: ["betting-site", slug || id],
        queryFn: async (): Promise<any> => {
            if (slug) {
                const { data, error } = await supabase
                    .from("betting_sites")
                    .select("*")
                    .eq("is_active", true)
                    .eq("slug", slug)
                    .maybeSingle();

                if (error) throw error;
                if (!data) throw new Error("Site not found");
                return data;
            } else if (id) {
                const { data, error } = await supabase
                    .from("betting_sites")
                    .select("*")
                    .eq("is_active", true)
                    .eq("id", id)
                    .maybeSingle();

                if (error) throw error;
                if (!data) throw new Error("Site not found");
                return data;
            }
            throw new Error("No slug or id provided");
        },
        retry: false,
        staleTime: 5 * 60 * 1000,
    });

    // 2. Fetch Bonus Offers
    const { data: bonusOffers } = useQuery({
        queryKey: ['site-bonus-offers', slug || id],
        queryFn: async () => {
            if (!site?.id) return [];
            const { data, error } = await supabase
                .from('bonus_offers')
                .select('*')
                .eq('site_id', site.id)
                .eq('is_active', true)
                .order('display_order', { ascending: true });
            if (error) throw error;
            return data || [];
        },
        enabled: !!site?.id,
    });

    // 3. Fetch Reviews
    const { data: reviews, isLoading: reviewsLoading } = useQuery({
        queryKey: ["site-reviews", site?.id],
        queryFn: async () => {
            if (!site?.id) return [];
            const { data: reviewsData, error: reviewsError } = await supabase
                .from("site_reviews")
                .select("*")
                .eq("site_id", site.id)
                .eq("is_approved", true)
                .order("created_at", { ascending: false });

            if (reviewsError) throw reviewsError;

            const userIds = reviewsData
                .map((r: any) => r.user_id)
                .filter((id: string | null) => id !== null);

            let profilesData: any[] = [];
            if (userIds.length > 0) {
                const { data, error: profilesError } = await supabase
                    .from("profiles")
                    .select("id, username, avatar_url")
                    .in("id", userIds);

                if (profilesError) throw profilesError;
                profilesData = data || [];
            }

            return reviewsData.map((review: any) => {
                const profile = profilesData?.find((p: any) => p.id === review.user_id);
                return {
                    ...review,
                    type: 'review',
                    profiles: profile ? { username: profile.username || "Anonim", avatar_url: profile.avatar_url } : undefined,
                };
            });
        },
        enabled: !!site?.id,
        staleTime: 5 * 60 * 1000,
    });

    // 4. Fetch Complaints
    const { data: complaints, isLoading: complaintsLoading } = useQuery({
        queryKey: ["site-complaints", site?.id],
        queryFn: async () => {
            if (!site?.id) return [];
            const { data: complaintsData, error: complaintsError } = await supabase
                .from("site_complaints")
                .select("*")
                .eq("site_id", site.id)
                .eq("is_public", true)
                .order("created_at", { ascending: false });

            if (complaintsError) throw complaintsError;

            const userIds = complaintsData
                .map((c: any) => c.user_id)
                .filter((id: string | null) => id !== null);

            let profilesData: any[] = [];
            if (userIds.length > 0) {
                const { data, error: profilesError } = await supabase
                    .from("profiles")
                    .select("id, username, avatar_url")
                    .in("id", userIds);

                if (profilesError) throw profilesError;
                profilesData = data || [];
            }

            return complaintsData.map((complaint: any) => {
                const profile = profilesData?.find((p: any) => p.id === complaint.user_id);
                return {
                    ...complaint,
                    type: 'complaint',
                    profiles: profile ? { username: profile.username || "Anonim", avatar_url: profile.avatar_url } : undefined,
                };
            });
        },
        enabled: !!site?.id,
        staleTime: 5 * 60 * 1000,
    });

    // 5. Track View
    useEffect(() => {
        if (!site?.id || viewTracked) return;

        const trackView = async () => {
            const sessionId = sessionStorage.getItem('analytics_session_id') || `session_${Date.now()}`;
            const { error } = await supabase.rpc('track_conversion', {
                p_conversion_type: 'page_view',
                p_page_path: window.location.pathname,
                p_site_id: site.id,
                p_conversion_value: 0,
                p_session_id: sessionId,
                p_metadata: {},
            });

            if (error) {
                console.error('View tracking failed:', error);
                return;
            }
            setViewTracked(true);
            queryClient.setQueryData(["site-stats", site.id], (old: any) => {
                if (!old) return old;
                return { ...old, views: (old.views || 0) + 1 };
            });
        };
        trackView();
    }, [site?.id, viewTracked, queryClient]);

    // 6. Handle Logo URL
    useEffect(() => {
        if (site?.logo_url) {
            if (site.logo_url.startsWith('http')) {
                setLogoUrl(site.logo_url);
            } else {
                const { data } = supabase.storage.from('site-logos').getPublicUrl(site.logo_url);
                const absoluteUrl = data.publicUrl.startsWith('http')
                    ? data.publicUrl
                    : `${window.location.origin}${data.publicUrl}`;
                setLogoUrl(absoluteUrl);
            }
        }
    }, [site?.logo_url]);

    // 7. Affiliate Click Tracking
    const trackClickMutation = useMutation({
        mutationFn: async () => {
            if (!site?.id) return;
            const sessionId = sessionStorage.getItem('analytics_session_id') || `session_${Date.now()}`;
            const { error } = await supabase.rpc('track_conversion', {
                p_conversion_type: 'affiliate_click',
                p_page_path: window.location.pathname,
                p_site_id: site.id,
                p_conversion_value: 0,
                p_session_id: sessionId,
                p_metadata: { site_name: site.name },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["site-stats", site?.id] });
        },
    });

    const handleAffiliateClick = async () => {
        if (site?.affiliate_link && site?.id) {
            trackClickMutation.mutate();
            try {
                analytics.trackAffiliateClick(site.id, site.name);
            } catch (error) { }
            window.open(site.affiliate_link, "_blank");
        }
    };

    const handleToggleFavorite = () => {
        if (!user) {
            toast.error("Favorilere eklemek için giriş yapmalısınız");
            navigate("/login");
            return;
        }
        if (!site?.id) return;
        toggleFavorite({ siteId: site.id, isFavorite: checkFavorite(site.id) });
    };

    const averageRating = reviews?.length
        ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : (site?.avg_rating && site.avg_rating > 0 ? site.avg_rating : site?.rating || 0).toFixed(1);

    return {
        site,
        siteLoading,
        siteError,
        bonusOffers,
        reviews,
        complaints,
        logoUrl,
        averageRating,
        isFavorite: checkFavorite(site?.id),
        isTogglingFavorite: isToggling,
        handleToggleFavorite,
        handleAffiliateClick,
    };
}
