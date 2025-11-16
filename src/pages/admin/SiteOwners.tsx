import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const SiteOwners = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery({
    queryKey: ['site-owner-applications'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('site_owners')
        .select(`
          *,
          betting_sites (name, slug, logo_url),
          profiles (email, username)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const approveMutation = useMutation({
    mutationFn: async ({ ownerId, userId }: { ownerId: string; userId: string }) => {
      const application = applications?.find(app => app.id === ownerId);
      if (!application) throw new Error('Application not found');

      let siteId = application.site_id;

      // If new_site_name is provided, create a new site
      if (application.new_site_name && !siteId) {
        const slug = application.new_site_name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        const { data: newSite, error: siteError } = await (supabase as any)
          .from('betting_sites')
          .insert({
            name: application.new_site_name,
            slug: slug,
            affiliate_link: 'https://example.com',
            logo_url: application.logo_url,
            is_active: true
          })
          .select()
          .single();

        if (siteError) throw siteError;
        siteId = newSite.id;
      }

      const { error: ownerError } = await (supabase as any)
        .from('site_owners')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          site_id: siteId
        })
        .eq('id', ownerId);
      
      if (ownerError) throw ownerError;

      const { error: roleError } = await (supabase as any)
        .from('user_roles')
        .update({ status: 'approved' })
        .eq('user_id', userId)
        .eq('role', 'site_owner' as any);
      
      if (roleError) throw roleError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-owner-applications'] });
      toast({
        title: 'Başarılı',
        description: 'Site sahibi başvurusu onaylandı',
      });
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'İşlem sırasında bir hata oluştu',
        variant: 'destructive',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ ownerId, userId }: { ownerId: string; userId: string }) => {
      const { error: ownerError } = await (supabase as any)
        .from('site_owners')
        .update({ status: 'rejected' })
        .eq('id', ownerId);
      
      if (ownerError) throw ownerError;

      // Update user_roles status
      const { error: roleError } = await (supabase as any)
        .from('user_roles')
        .update({ status: 'rejected' })
        .eq('user_id', userId)
        .eq('role', 'site_owner' as any);
      
      if (roleError) throw roleError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-owner-applications'] });
      toast({
        title: 'Başarılı',
        description: 'Site sahibi başvurusu reddedildi',
      });
    },
  });

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Bu sayfaya erişim yetkiniz yok</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Site Sahipleri Yönetimi"
        description="Site sahibi başvurularını yönetin"
      />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Site Sahipleri</h1>
          <p className="text-muted-foreground">
            Site sahibi başvurularını yönetin
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : applications && applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app: any) => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {app.betting_sites?.logo_url && (
                        <img 
                          src={app.betting_sites.logo_url} 
                          alt={app.betting_sites.name}
                          className="w-8 h-8 object-contain"
                        />
                      )}
                      {app.betting_sites?.name}
                    </CardTitle>
                    <Badge variant={
                      app.status === 'approved' ? 'default' :
                      app.status === 'rejected' ? 'destructive' : 'secondary'
                    }>
                      {app.status === 'approved' ? 'Onaylandı' :
                       app.status === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Email:</span> {app.profiles?.email}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Başvuru Tarihi:</span>{' '}
                      {new Date(app.created_at).toLocaleDateString('tr-TR')}
                    </p>
                    
                    {app.status === 'pending' && (
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          onClick={() => approveMutation.mutate({ ownerId: app.id, userId: app.user_id })}
                          disabled={approveMutation.isPending}
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Onayla
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectMutation.mutate({ ownerId: app.id, userId: app.user_id })}
                          disabled={rejectMutation.isPending}
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reddet
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">Henüz başvuru bulunmuyor</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default SiteOwners;
