
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
import { CheckCircle, XCircle, Trash2, UserCog } from 'lucide-react';

interface UserTableProps {
    users: any[];
    selectedUserIds: string[];
    onToggleSelectAll: () => void;
    onToggleUserSelection: (userId: string) => void;
    onSelectUser: (user: any) => void;
    onApprove: (userId: string) => void;
    onReject: (userId: string) => void;
    onDelete: (userId: string) => void;
    onImpersonate: (user: any) => void;
    approvePending: boolean;
    rejectPending: boolean;
    deletePending: boolean;
}

export function IndividualUserTable({
    users,
    selectedUserIds,
    onToggleSelectAll,
    onToggleUserSelection,
    onSelectUser,
    onApprove,
    onReject,
    onDelete,
    onImpersonate,
    approvePending,
    rejectPending,
    deletePending
}: UserTableProps) {
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
                    <TableHead>Email</TableHead>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Kullanıcı Adı</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Kayıt Tarihi</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.length > 0 ? (
                    users.map((user: any) => (
                        <TableRow key={user.id} className="hover:bg-muted/50">
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                    checked={selectedUserIds.includes(user.user_id)}
                                    onCheckedChange={() => onToggleUserSelection(user.user_id)}
                                />
                            </TableCell>
                            <TableCell onClick={() => onSelectUser(user)} className="cursor-pointer">{user.profile?.email || '-'}</TableCell>
                            <TableCell onClick={() => onSelectUser(user)} className="cursor-pointer">
                                {user.profile?.first_name && user.profile?.last_name
                                    ? `${user.profile.first_name} ${user.profile.last_name}`
                                    : '-'}
                            </TableCell>
                            <TableCell onClick={() => onSelectUser(user)} className="cursor-pointer">{user.profile?.phone || '-'}</TableCell>
                            <TableCell onClick={() => onSelectUser(user)} className="cursor-pointer">{user.profile?.username || '-'}</TableCell>
                            <TableCell onClick={() => onSelectUser(user)} className="cursor-pointer">
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                    {user.role === 'admin' ? 'Admin' : user.role === 'moderator' ? 'Moderatör' : 'Kullanıcı'}
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
                                {user.profile?.created_at
                                    ? new Date(user.profile.created_at).toLocaleDateString('tr-TR')
                                    : '-'}
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
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground">
                            Henüz bireysel kullanıcı bulunmuyor
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
