
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showSuccessToast, showErrorToast } from '@/lib/toastHelpers';
import { useToast } from '@/hooks/use-toast';

export interface UserFilterState {
    searchQuery: string;
    roleFilter: string;
    statusFilter: string;
    verificationFilter: string;
    currentPage: number;
    pageSize: number;
    activeTab: string;
}

export function useUsers() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // State
    const [activeTab, setActiveTab] = useState('individual');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [verificationFilter, setVerificationFilter] = useState('all');

    // Bulk Selection State
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    const [bulkProgress, setBulkProgress] = useState(0);

    // Fetch Total Count
    const { data: totalCount } = useQuery({
        queryKey: ['admin-users-count', activeTab, searchQuery, roleFilter, statusFilter, verificationFilter],
        queryFn: async () => {
            let query = supabase
                .from('profiles')
                .select('id', { count: 'exact', head: true });

            if (activeTab === 'individual') {
                query = query.eq('user_type', 'individual');
            } else {
                query = query.eq('user_type', 'corporate');
            }

            if (searchQuery) {
                query = query.or(`email.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%`);
            }

            if (activeTab === 'corporate' && verificationFilter !== 'all') {
                query = query.eq('is_verified', verificationFilter === 'verified');
            }

            const { count } = await query;
            return count || 0;
        },
    });

    // Fetch Users
    const { data: users, isLoading } = useQuery({
        queryKey: ['admin-users', currentPage, pageSize, activeTab, searchQuery, roleFilter, statusFilter, verificationFilter],
        queryFn: async () => {
            const from = (currentPage - 1) * pageSize;
            const to = from + pageSize - 1;

            let profileQuery = supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })
                .range(from, to);

            if (activeTab === 'individual') {
                profileQuery = profileQuery.eq('user_type', 'individual');
            } else {
                profileQuery = profileQuery.eq('user_type', 'corporate');
            }

            if (searchQuery) {
                profileQuery = profileQuery.or(`email.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%`);
            }

            if (activeTab === 'corporate' && verificationFilter !== 'all') {
                profileQuery = profileQuery.eq('is_verified', verificationFilter === 'verified');
            }

            const { data: profiles, error: profilesError } = await profileQuery;

            if (profilesError) throw profilesError;
            if (!profiles) return [];

            const profileIds = profiles.map(p => p.id);

            const { data: roles } = await supabase
                .from('user_roles')
                .select('*')
                .in('user_id', profileIds);

            const { data: siteOwners } = await supabase
                .from('site_owners')
                .select(`*, betting_sites:site_id(id, name, slug)`)
                .in('user_id', profileIds);

            let filteredProfiles = profiles.map(profile => {
                const role = roles?.find(r => r.user_id === profile.id);
                const siteOwner = siteOwners?.find(so => so.user_id === profile.id);

                return {
                    id: role?.id || `profile-${profile.id}`,
                    user_id: profile.id,
                    role: role?.role || null,
                    status: role?.status || 'pending',
                    created_at: role?.created_at || profile.created_at,
                    profile: {
                        ...profile,
                        email: profile.email || 'Email bilgisi yok'
                    },
                    site_owner: siteOwner || null
                };
            });

            if (roleFilter !== 'all') {
                filteredProfiles = filteredProfiles.filter(u => u.role === roleFilter);
            }

            if (statusFilter !== 'all') {
                filteredProfiles = filteredProfiles.filter(u => u.status === statusFilter);
            }

            return filteredProfiles;
        },
    });

    // Mutations
    const verifyMutation = useMutation({
        mutationFn: async (userId: string) => {
            const { error } = await supabase.from('profiles').update({ is_verified: true }).eq('id', userId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast({ title: 'Başarılı', description: 'Kurumsal kullanıcı doğrulandı' });
        },
    });

    const approveMutation = useMutation({
        mutationFn: async (userId: string) => {
            const { data: existingRole } = await supabase.from('user_roles').select('id').eq('user_id', userId).maybeSingle();

            if (existingRole) {
                const { error } = await supabase.from('user_roles').update({ status: 'approved' }).eq('user_id', userId);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'user', status: 'approved' });
                if (error) throw error;
            }

            const { error: profileError } = await supabase.from('profiles').update({ is_verified: true }).eq('id', userId).eq('user_type', 'corporate');
            if (profileError) throw profileError;

            const { data: { user } } = await supabase.auth.getUser();
            await (supabase as any)
                .from('site_owners')
                .update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: user?.id })
                .eq('user_id', userId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-users-count'] });
            toast({ title: 'Başarılı', description: 'Kullanıcı onaylandı ve doğrulandı' });
        },
        onError: (error: any) => showErrorToast(error, 'Kullanıcı onaylanırken hata oluştu'),
    });

    const rejectMutation = useMutation({
        mutationFn: async (userId: string) => {
            const { data: existingRole } = await supabase.from('user_roles').select('id').eq('user_id', userId).maybeSingle();

            if (existingRole) {
                const { error } = await supabase.from('user_roles').update({ status: 'rejected' }).eq('user_id', userId);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'user', status: 'rejected' });
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast({ title: 'Başarılı', description: 'Kullanıcı reddedildi' });
        },
        onError: (error: any) => showErrorToast(error, 'Kullanıcı reddedilirken hata oluştu'),
    });

    const deleteMutation = useMutation({
        mutationFn: async (userId: string) => {
            const { error: profileError } = await supabase.from('profiles').delete().eq('id', userId);
            if (profileError) throw profileError;
            const { error: roleError } = await supabase.from('user_roles').delete().eq('user_id', userId);
            if (roleError) throw roleError;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-users-count'] });
            showSuccessToast('Kullanıcı başarıyla silindi');
        },
        onError: (error: any) => showErrorToast(error, 'Kullanıcı silinirken hata oluştu'),
    });

    // Bulk Actions
    const handleBulkApprove = async () => {
        setIsBulkProcessing(true);
        setBulkProgress(0);
        let completed = 0;

        for (const userId of selectedUserIds) {
            await approveMutation.mutateAsync(userId);
            completed++;
            setBulkProgress((completed / selectedUserIds.length) * 100);
        }
        setIsBulkProcessing(false);
        setSelectedUserIds([]);
        toast({ title: 'Tamamlandı', description: `${selectedUserIds.length} kullanıcı onaylandı` });
    };

    const handleBulkReject = async () => {
        setIsBulkProcessing(true);
        setBulkProgress(0);
        let completed = 0;

        for (const userId of selectedUserIds) {
            await rejectMutation.mutateAsync(userId);
            completed++;
            setBulkProgress((completed / selectedUserIds.length) * 100);
        }
        setIsBulkProcessing(false);
        setSelectedUserIds([]);
        toast({ title: 'Tamamlandı', description: `${selectedUserIds.length} kullanıcı reddedildi` });
    };

    const handleBulkDelete = async () => {
        setIsBulkProcessing(true);
        setBulkProgress(0);
        let completed = 0;
        const errors: string[] = [];

        for (const userId of selectedUserIds) {
            try {
                await deleteMutation.mutateAsync(userId);
                completed++;
                setBulkProgress((completed / selectedUserIds.length) * 100);
            } catch (error: any) {
                errors.push(`Kullanıcı ${userId}: ${error.message}`);
                completed++;
            }
        }

        if (errors.length > 0) {
            showErrorToast(new Error(`${errors.length} kullanıcı silinemedi`), `Kısmi başarı`);
        } else {
            showSuccessToast(`${completed} kullanıcı silindi`);
        }
        setIsBulkProcessing(false);
        setSelectedUserIds([]);
    };

    const handleBulkVerify = async () => {
        setIsBulkProcessing(true);
        setBulkProgress(0);
        let completed = 0;
        for (const userId of selectedUserIds) {
            await verifyMutation.mutateAsync(userId);
            completed++;
            setBulkProgress((completed / selectedUserIds.length) * 100);
        }
        setIsBulkProcessing(false);
        setSelectedUserIds([]);
        toast({ title: 'Tamamlandı', description: `${selectedUserIds.length} kullanıcı doğrulandı` });
    };

    return {
        // State
        activeTab, setActiveTab,
        currentPage, setCurrentPage,
        pageSize, setPageSize,
        searchQuery, setSearchQuery,
        roleFilter, setRoleFilter,
        statusFilter, setStatusFilter,
        verificationFilter, setVerificationFilter,
        selectedUserIds, setSelectedUserIds,
        isBulkProcessing, bulkProgress,

        // Data
        users,
        totalCount,
        isLoading,

        // Actions
        verifyMutation,
        approveMutation,
        rejectMutation,
        deleteMutation,
        handleBulkApprove,
        handleBulkReject,
        handleBulkDelete,
        handleBulkVerify
    };
}
