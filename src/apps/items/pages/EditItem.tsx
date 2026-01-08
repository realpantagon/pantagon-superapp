import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/utils/supabase';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';
import Select from '../../../shared/components/Select';

export default function EditItem() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    group_name: '',
    buy_date: '',
    buy_price: '',
    extra_cost: '0',
    sell_date: '',
    sell_price: '',
    status: 'owned',
    purchase_source: '',
    warranty_expire_date: '',
    reason_to_sell: '',
    note: '',
  });

  useEffect(() => {
    if (id) {
      fetchItem(id);
    }
  }, [id]);

  const fetchItem = async (itemId: string) => {
    try {
      const { data, error } = await supabase
        .from('pantagon_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name,
          category: data.category || '',
          group_name: data.group_name || '',
          buy_date: data.buy_date,
          buy_price: data.buy_price.toString(),
          extra_cost: data.extra_cost.toString(),
          sell_date: data.sell_date || '',
          sell_price: data.sell_price?.toString() || '',
          status: data.status,
          purchase_source: data.purchase_source || '',
          warranty_expire_date: data.warranty_expire_date || '',
          reason_to_sell: data.reason_to_sell || '',
          note: data.note || '',
        });
      }
    } catch (error) {
      console.error('Error fetching item:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.buy_date) {
      newErrors.buy_date = 'Buy date is required';
    }
    if (!formData.buy_price || parseFloat(formData.buy_price) <= 0) {
      newErrors.buy_price = 'Buy price must be greater than 0';
    }
    if (formData.sell_date && formData.sell_price && parseFloat(formData.sell_price) <= 0) {
      newErrors.sell_price = 'Sell price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('pantagon_items')
        .update({
          name: formData.name.trim(),
          category: formData.category.trim() || null,
          group_name: formData.group_name.trim() || null,
          buy_date: formData.buy_date,
          buy_price: parseFloat(formData.buy_price),
          extra_cost: parseFloat(formData.extra_cost) || 0,
          sell_date: formData.sell_date || null,
          sell_price: formData.sell_price ? parseFloat(formData.sell_price) : null,
          status: formData.status,
          purchase_source: formData.purchase_source.trim() || null,
          warranty_expire_date: formData.warranty_expire_date || null,
          reason_to_sell: formData.reason_to_sell.trim() || null,
          note: formData.note.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      navigate(`/items-app/${id}`);
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Item</h1>
        <Button variant="secondary" onClick={() => navigate(`/items-app/${id}`)}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="space-y-4">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder="e.g., iPhone 14 Pro"
                />

                <Input
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Electronics"
                />

                <Input
                  label="Group Name"
                  name="group_name"
                  value={formData.group_name}
                  onChange={handleChange}
                  placeholder="e.g., Smartphones"
                />

                <Select
                  label="Status *"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={[
                    { value: 'owned', label: 'Owned' },
                    { value: 'sold', label: 'Sold' },
                  ]}
                />
              </div>
            </div>

            {/* Purchase Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Purchase Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Buy Date *"
                  name="buy_date"
                  type="date"
                  value={formData.buy_date}
                  onChange={handleChange}
                  error={errors.buy_date}
                />

                <Input
                  label="Buy Price * (฿)"
                  name="buy_price"
                  type="number"
                  step="0.01"
                  value={formData.buy_price}
                  onChange={handleChange}
                  error={errors.buy_price}
                  placeholder="0.00"
                />

                <Input
                  label="Extra Cost (฿)"
                  name="extra_cost"
                  type="number"
                  step="0.01"
                  value={formData.extra_cost}
                  onChange={handleChange}
                  placeholder="0.00"
                />

                <Input
                  label="Purchase Source"
                  name="purchase_source"
                  value={formData.purchase_source}
                  onChange={handleChange}
                  placeholder="e.g., Apple Store"
                />

                <Input
                  label="Warranty Expire Date"
                  name="warranty_expire_date"
                  type="date"
                  value={formData.warranty_expire_date}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Sell Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Sell Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Sell Date"
                  name="sell_date"
                  type="date"
                  value={formData.sell_date}
                  onChange={handleChange}
                />

                <Input
                  label="Sell Price (฿)"
                  name="sell_price"
                  type="number"
                  step="0.01"
                  value={formData.sell_price}
                  onChange={handleChange}
                  error={errors.sell_price}
                  placeholder="0.00"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason to Sell
                </label>
                <textarea
                  name="reason_to_sell"
                  value={formData.reason_to_sell}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Why are you selling this item?"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Note
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/items-app/${id}`)}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Item'}
              </Button>

            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
