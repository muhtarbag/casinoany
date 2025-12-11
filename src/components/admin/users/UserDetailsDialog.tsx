
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Loader2, Building2, UserCircle, Mail, MessageSquare, Send, Phone } from 'lucide-react';

interface UserDetailsDialogProps {
    user: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onVerify: (userId: string) => void;
    verifyPending: boolean;
}

export function UserDetailsDialog({
    user,
    open,
    onOpenChange,
    onVerify,
    verifyPending
}: UserDetailsDialogProps) {
    if (!user) return null;

    const isCorporate = user.profile?.user_type === 'corporate';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isCorporate ? (
                            <><Building2 className="w-5 h-5" />Kurumsal Kullanıcı Detayları</>
                        ) : (
                            <><UserCircle className="w-5 h-5" />Kullanıcı Detayları</>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {user.profile?.company_name || `${user.profile?.first_name} ${user.profile?.last_name}`}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Durum Bilgisi */}
                    <div className="flex gap-3">
                        <Badge
                            variant={
                                user.status === 'approved'
                                    ? 'default'
                                    : user.status === 'rejected'
                                        ? 'destructive'
                                        : 'secondary'
                            }
                            className="text-sm"
                        >
                            {user.status === 'approved' ? 'Onaylandı' : user.status === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
                        </Badge>
                        {user.profile?.is_verified && (
                            <Badge variant="default" className="text-sm">
                                <Shield className="w-3 h-3 mr-1" />Doğrulanmış
                            </Badge>
                        )}
                    </div>

                    {isCorporate ? (
                        /* Kurumsal Kullanıcı Detayları */
                        <Tabs defaultValue="company" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="company">Şirket</TabsTrigger>
                                <TabsTrigger value="site">Site</TabsTrigger>
                                <TabsTrigger value="contact">İletişim</TabsTrigger>
                                <TabsTrigger value="social">Sosyal</TabsTrigger>
                            </TabsList>

                            <TabsContent value="company" className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Şirket Adı</label>
                                        <p className="text-sm text-muted-foreground">{user.profile?.company_name || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Yetkili Kişi</label>
                                        <p className="text-sm text-muted-foreground">{user.profile?.company_authorized_person || user.profile?.contact_person_name || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Web Sitesi</label>
                                        <p className="text-sm text-muted-foreground">{user.profile?.company_website || '-'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-sm font-medium">Açıklama</label>
                                        <p className="text-sm text-muted-foreground">{user.profile?.company_description || user.site_owner?.description || '-'}</p>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="site" className="space-y-4 mt-4">
                                {user.site_owner?.logo_url && (
                                    <div>
                                        <label className="text-sm font-medium">Logo</label>
                                        <img src={user.site_owner.logo_url} alt="Site Logo" className="h-20 object-contain mt-2 rounded border p-2" />
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Site</label>
                                        <p className="text-sm text-muted-foreground">
                                            {user.site_owner?.betting_sites?.name || user.site_owner?.new_site_name || 'Site bilgisi yok'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Durum</label>
                                        <p className="text-sm">
                                            <Badge variant={user.site_owner?.status === 'approved' ? 'default' : 'secondary'}>
                                                {user.site_owner?.status === 'approved' ? 'Aktif' : 'Bekliyor'}
                                            </Badge>
                                        </p>
                                    </div>
                                    {user.site_owner?.approved_at && (
                                        <div className="col-span-2">
                                            <label className="text-sm font-medium">Onay Tarihi</label>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(user.site_owner.approved_at).toLocaleDateString('tr-TR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="contact" className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Mail className="w-4 h-4" />Email
                                        </label>
                                        <p className="text-sm text-muted-foreground">{user.site_owner?.contact_email || user.profile?.contact_email || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4" />Teams
                                        </label>
                                        <p className="text-sm text-muted-foreground">{user.site_owner?.contact_teams || user.profile?.contact_teams || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Send className="w-4 h-4" />Telegram
                                        </label>
                                        <p className="text-sm text-muted-foreground">{user.site_owner?.contact_telegram || user.profile?.contact_telegram || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Phone className="w-4 h-4" />WhatsApp
                                        </label>
                                        <p className="text-sm text-muted-foreground">{user.site_owner?.contact_whatsapp || user.profile?.contact_whatsapp || '-'}</p>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="social" className="space-y-4 mt-4">
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { label: 'Facebook', field: 'social_facebook', icon: 'facebook' },
                                        { label: 'Twitter/X', field: 'social_twitter', icon: 'twitter' },
                                        { label: 'Instagram', field: 'social_instagram', icon: 'instagram' },
                                        { label: 'LinkedIn', field: 'social_linkedin', icon: 'linkedin' },
                                        { label: 'YouTube', field: 'social_youtube', icon: 'youtube' },
                                        { label: 'Telegram Kanal', field: 'social_telegram_channel', icon: 'telegram' },
                                        { label: 'Kick', field: 'social_kick', icon: 'kick' },
                                        { label: 'Discord', field: 'social_discord', icon: 'discord' },
                                        { label: 'Bio Link', field: 'bio_link', icon: 'link' }
                                    ].map(social => {
                                        const value = user.site_owner?.[social.field] || user.profile?.[social.field];
                                        return (
                                            <div key={social.field}>
                                                <label className="text-sm font-medium">{social.label}</label>
                                                <p className="text-sm text-muted-foreground break-all">
                                                    {value || '-'}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </TabsContent>
                        </Tabs>
                    ) : (
                        /* Bireysel Kullanıcı Detayları */
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Ad Soyad</label>
                                    <p className="text-sm text-muted-foreground">
                                        {user.profile?.first_name} {user.profile?.last_name}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Kullanıcı Adı</label>
                                    <p className="text-sm text-muted-foreground">{user.profile?.username || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Email</label>
                                    <p className="text-sm text-muted-foreground">{user.profile?.email || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Telefon</label>
                                    <p className="text-sm text-muted-foreground">{user.profile?.phone || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Şehir</label>
                                    <p className="text-sm text-muted-foreground">{user.profile?.city || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">İlçe</label>
                                    <p className="text-sm text-muted-foreground">{user.profile?.district || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Favori Takım</label>
                                    <p className="text-sm text-muted-foreground">{user.profile?.favorite_team || '-'}</p>
                                </div>
                            </div>

                            {user.profile?.interests && user.profile.interests.length > 0 && (
                                <div>
                                    <label className="text-sm font-medium">İlgi Alanları</label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {user.profile.interests.map((interest: string) => (
                                            <Badge key={interest} variant="secondary">{interest}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {isCorporate && !user.profile?.is_verified && user.status === 'approved' && (
                        <Button
                            onClick={() => onVerify(user.user_id)}
                            disabled={verifyPending}
                        >
                            {verifyPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
                            Doğrula
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
