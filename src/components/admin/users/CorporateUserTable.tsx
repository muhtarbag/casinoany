
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, XCircle, Trash2, Building2, Shield, UserCog } from 'lucide-react';

interface CorporateUserTableProps {
    users: any[];
    selectedUserIds: string[];
    onToggleSelectAll: () => void;
    onToggleUserSelection: (userId: string) => void;
    onSelectUser: (user: any) => void;
    onApprove: (userId: string) => void;
    onReject: (userId: string) => void;
    onDelete: (userId: string) => void;
    onVerify: (userId: string) => void;
    onImpersonate: (user: any) => void;
    approvePending: boolean;
    rejectPending: boolean;
    deletePending: boolean;
    verifyPending: boolean;
}

export function CorporateUserTable({
    users,
    selectedUserIds,
    onToggleSelectAll,
    onToggleUserSelection,
    onSelectUser,
    onApprove,
    onReject,
    onDelete,
    onVerify,
    onImpersonate,
    approvePending,
    rejectPending,
    deletePending,
    verifyPending
}: CorporateUserTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-12">
                        <Checkbox
                            checked={selectedUserIds.length === users.length && users.length > 0}
                            onCheckedChange={onToggleSelectAll}
                        />
                    </TableHead>
                    <TableHead>Şirket/Site</TableHead>
                    <TableHead>Yetkili Kişi</TableHead>
                    <TableHead>İletişim</TableHead>
                    <TableHead>Sosyal Medya</TableHead>
                    <TableHead>Doğrulama</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Kayıt</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.length > 0 ? (
                    users.map((user: any) => {
                        const so = user.site_owner;
                        const siteName = so?.betting_sites?.name || so?.new_site_name || '-';

                        return (
                            <TableRow key={user.id} className="hover:bg-muted/50">
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        checked={selectedUserIds.includes(user.user_id)}
                                        onCheckedChange={() => onToggleUserSelection(user.user_id)}
                                    />
                                </TableCell>
                                <TableCell onClick={() => onSelectUser(user)} className="cursor-pointer">
                                    <div className="space-y-1">
                                        <div className="font-medium flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-muted-foreground" />
                                            {user.profile?.company_name || '-'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Site: {siteName}</div>
                                    </div>
                                </TableCell>
                                <TableCell onClick={() => onSelectUser(user)} className="cursor-pointer">
                                    <div className="space-y-1">
                                        <div className="text-sm">{so?.contact_person_name || user.profile?.contact_person_name || '-'}</div>
                                        <div className="text-xs text-muted-foreground">{so?.contact_email || user.profile?.email || '-'}</div>
                                    </div>
                                </TableCell>
                                <TableCell onClick={() => onSelectUser(user)} className="cursor-pointer">
                                    <div className="flex gap-1 flex-wrap">
                                        {(so?.contact_teams || user.profile?.contact_teams) && (
                                            <Badge variant="outline" className="text-xs">Teams</Badge>
                                        )}
                                        {(so?.contact_telegram || user.profile?.contact_telegram) && (
                                            <Badge variant="outline" className="text-xs">Telegram</Badge>
                                        )}
                                        {(so?.contact_whatsapp || user.profile?.contact_whatsapp) && (
                                            <Badge variant="outline" className="text-xs">WhatsApp</Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell onClick={() => onSelectUser(user)} className="cursor-pointer">
                                    <div className="flex gap-1 flex-wrap">
                                        {(so?.social_facebook || user.profile?.social_facebook) && <Badge variant="secondary" className="text-xs">FB</Badge>}
                                        {(so?.social_twitter || user.profile?.social_twitter) && <Badge variant="secondary" className="text-xs">X</Badge>}
                                        {(so?.social_instagram || user.profile?.social_instagram) && <Badge variant="secondary" className="text-xs">IG</Badge>}
                                    </div>
                                </TableCell>
                                <TableCell onClick={() => onSelectUser(user)} className="cursor-pointer">
                                    <Badge variant={user.profile?.is_verified ? 'default' : 'secondary'}>
                                        {user.profile?.is_verified ? (
                                            <span className="flex items-center gap-1">
                                                <Shield className="w-3 h-3" /> Doğrulandı
                                            </span>
                                        ) : (
                                            'Doğrulanmadı'
                                        )}
                                    </Badge>
                                </TableCell>
                                <TableCell onClick={() => onSelectUser(user)} className="cursor-pointer">
                                    <Badge
                                        variant={
                                            user.status === 'approved'
                                                ? 'default'
                                                : user.status === 'rejected'
                                                    ? 'destructive'
                                                    : 'secondary'
                                        }
                                    >
                                        {user.status === 'approved'
                                            ? 'Onaylandı'
                                            : user.status === 'rejected'
                                                ? 'Reddedildi'
                                                : 'Bekliyor'}
                                    </Badge>
                                </TableCell>
                                <TableCell onClick={() => onSelectUser(user)} className="cursor-pointer">
                                    <div className="text-sm text-muted-foreground">
                                        {user.profile?.created_at
                                            ? new Date(user.profile.created_at).toLocaleDateString('tr-TR')
                                            : '-'}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                        {user.status === 'pending' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    onClick={() => onApprove(user.user_id)}
                                                    disabled={approvePending}
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => onReject(user.user_id)}
                                                    disabled={rejectPending}
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                        {!user.profile?.is_verified && user.status === 'approved' && (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => onVerify(user.user_id)}
                                                disabled={verifyPending}
                                                title="Hesabı Doğrula"
                                            >
                                                <Shield className="w-4 h-4" />
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onImpersonate(user)}
                                            title="Üye Gibi Davran"
                                        >
                                            <UserCog className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onDelete(user.user_id)}
                                            disabled={deletePending}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })
                ) : (
                    <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground">
                            Henüz kurumsal kullanıcı bulunmuyor
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
