import { useState, useMemo } from 'react';

interface BonusOffer {
  id: string;
  site_id: string;
  title: string;
  bonus_amount: string;
  bonus_type: string;
  wagering_requirement: string | null;
  terms: string | null;
  eligibility: string | null;
  validity_period: string | null;
  display_order: number;
  is_active: boolean;
  image_url: string | null;
  betting_sites?: {
    name: string;
    logo_url: string;
    slug: string;
  };
}

export const useBonusFilters = (bonuses: BonusOffer[] = []) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSite, setSelectedSite] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const filteredBonuses = useMemo(() => {
    return bonuses.filter((bonus) => {
      // Search filter
      const matchesSearch = 
        searchQuery === '' ||
        bonus.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bonus.betting_sites?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      // Site filter
      const matchesSite = 
        selectedSite === 'all' || 
        bonus.site_id === selectedSite;

      // Status filter
      const matchesStatus = 
        selectedStatus === 'all' ||
        (selectedStatus === 'active' && bonus.is_active) ||
        (selectedStatus === 'inactive' && !bonus.is_active);

      // Type filter
      const matchesType = 
        selectedType === 'all' || 
        bonus.bonus_type === selectedType;

      return matchesSearch && matchesSite && matchesStatus && matchesType;
    });
  }, [bonuses, searchQuery, selectedSite, selectedStatus, selectedType]);

  const stats = useMemo(() => {
    return {
      total: bonuses.length,
      active: bonuses.filter(b => b.is_active).length,
      inactive: bonuses.filter(b => !b.is_active).length,
      filtered: filteredBonuses.length,
    };
  }, [bonuses, filteredBonuses]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSite('all');
    setSelectedStatus('all');
    setSelectedType('all');
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedSite,
    setSelectedSite,
    selectedStatus,
    setSelectedStatus,
    selectedType,
    setSelectedType,
    filteredBonuses,
    stats,
    clearFilters,
  };
};
