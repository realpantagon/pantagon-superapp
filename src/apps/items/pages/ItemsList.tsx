import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/utils/supabase';
import type { PantagonItem } from '../../../api/items/types';
import { format } from 'date-fns';
import { formatCurrency } from '../../../api/items/calculations';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';
import FilterChip from '../../../shared/components/FilterChip';

export default function ItemsList() {
  const navigate = useNavigate();
  const [items, setItems] = useState<PantagonItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PantagonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [groups, setGroups] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, selectedGroup, selectedStatus, selectedCategory]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('Pantagon_items')
        .select('*')
        .order('buy_date', { ascending: false });

      if (error) throw error;

      if (data) {
        setItems(data);
        
        const uniqueGroups = Array.from(new Set(data.map(item => item.group_name).filter(Boolean))) as string[];
        const uniqueCategories = Array.from(new Set(data.map(item => item.category).filter(Boolean))) as string[];
        
        setGroups(uniqueGroups);
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...items];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGroup) {
      filtered = filtered.filter(item => item.group_name === selectedGroup);
    }

    if (selectedStatus) {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
    setCurrentPage(1);
  };

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Items</h1>
        <Button onClick={() => navigate('/items-app/new')}>
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add
        </Button>
      </div>

      <Input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="bg-[#2d2d2d] border-gray-700 text-white"
      />

      <div className="bg-[#2d2d2d] border border-gray-700 rounded-lg p-3 space-y-3">
        <div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <FilterChip
              label="All"
              active={selectedStatus === null}
              onClick={() => setSelectedStatus(null)}
            />
            <FilterChip
              label="Owned"
              active={selectedStatus === 'owned'}
              onClick={() => setSelectedStatus('owned')}
            />
            <FilterChip
              label="Sold"
              active={selectedStatus === 'sold'}
              onClick={() => setSelectedStatus('sold')}
            />
          </div>
        </div>

        {groups.length > 0 && (
          <div>
            <select
              value={selectedGroup || ''}
              onChange={(e) => setSelectedGroup(e.target.value || null)}
              className="w-full px-3 py-2 bg-gray-900/60 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Groups</option>
              {groups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
        )}

        {categories.length > 0 && (
          <div>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="w-full px-3 py-2 bg-gray-900/60 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {paginatedItems.map(item => (
          <div
            key={item.id}
            onClick={() => navigate(`/items-app/${item.id}`)}
            className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-3 active:bg-gray-700/50 cursor-pointer transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-medium flex-1">{item.name}</h3>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ml-2 ${
                item.status === 'owned'
                  ? 'bg-green-900 text-green-200'
                  : 'bg-blue-900 text-blue-200'
              }`}>
                {item.status}
              </span>
            </div>
            <div className="space-y-1 text-sm text-gray-400">
              <div className="flex justify-between">
                <span>{item.group_name || 'No Group'}</span>
                <span className="text-white font-medium">{formatCurrency(item.buy_price)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Buy: {format(new Date(item.buy_date), 'MMM dd, yyyy')}</span>
                {item.sell_date && (
                  <span>Sell: {format(new Date(item.sell_date), 'MMM dd, yyyy')}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No items found</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            ←
          </Button>
          <span className="text-sm text-gray-300 px-3">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            →
          </Button>
        </div>
      )}
    </div>
  );
}
