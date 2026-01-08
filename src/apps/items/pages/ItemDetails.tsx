import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/utils/supabase';
import type { PantagonItem } from '../../../api/items/types';
import { enrichItemWithMetrics, formatCurrency } from '../../../api/items/calculations';
import { format } from 'date-fns';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<PantagonItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchItem(id);
    }
  }, [id]);

  const fetchItem = async (itemId: string) => {
    try {
      const { data, error } = await supabase
        .from('Pantagon_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (error) throw error;
      setItem(data);
    } catch (error) {
      console.error('Error fetching item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!item || !confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from('Pantagon_items')
        .delete()
        .eq('id', item.id);

      if (error) throw error;
      navigate('/items-app/list');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Item not found</p>
        <Button onClick={() => navigate('/items-app/list')} className="mt-4">
          Back to Items
        </Button>
      </div>
    );
  }

  const enrichedItem = enrichItemWithMetrics(item);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            className="text-primary-600 dark:text-primary-400 font-medium"
            onClick={() => navigate('/items-app/list')}
          >
             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{item.name}</h1>

          </button>
        </div>

      </div>

      {/* Basic Information */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
            <p className="text-base font-medium text-gray-900 dark:text-white">{item.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
            <p className="text-base font-medium text-gray-900 dark:text-white">{item.category || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Group</p>
            <p className="text-base font-medium text-gray-900 dark:text-white">{item.group_name || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'owned'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}>
              {item.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Purchase Source</p>
            <p className="text-base font-medium text-gray-900 dark:text-white">{item.purchase_source || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Warranty Expires</p>
            <p className="text-base font-medium text-gray-900 dark:text-white">
              {item.warranty_expire_date ? format(new Date(item.warranty_expire_date), 'MMM dd, yyyy') : '-'}
            </p>
          </div>
        </div>
      </Card>

      {/* Financial Information */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Financial Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Buy Price</p>
            <p className="text-base font-medium text-gray-900 dark:text-white">{formatCurrency(item.buy_price)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Extra Cost</p>
            <p className="text-base font-medium text-gray-900 dark:text-white">{formatCurrency(item.extra_cost)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Real Cost (Total)</p>
            <p className="text-base font-bold text-primary-600 dark:text-primary-400">
              {formatCurrency(enrichedItem.real_cost)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Buy Date</p>
            <p className="text-base font-medium text-gray-900 dark:text-white">
              {format(new Date(item.buy_date), 'MMM dd, yyyy')}
            </p>
          </div>
          {item.sell_date && (
            <>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sell Date</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {format(new Date(item.sell_date), 'MMM dd, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sell Price</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {item.sell_price ? formatCurrency(item.sell_price) : '-'}
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Computed Metrics */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Cost Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Days Held</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{enrichedItem.days_held}</p>
          </div>
          {item.status === 'owned' && enrichedItem.cost_per_day && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cost Per Day</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(enrichedItem.cost_per_day)}
              </p>
            </div>
          )}
          {item.status === 'sold' && (
            <>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Cost Per Day (Sold)</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {enrichedItem.avg_cost_per_day_sold ? formatCurrency(enrichedItem.avg_cost_per_day_sold) : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Profit/Loss</p>
                <p className={`text-2xl font-bold ${(enrichedItem.profit || 0) >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
                  }`}>
                  {enrichedItem.profit ? formatCurrency(enrichedItem.profit) : '-'}
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Additional Information */}
      {(item.note || item.reason_to_sell) && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Additional Information</h2>
          {item.note && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Note</p>
              <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap">{item.note}</p>
            </div>
          )}
          {item.reason_to_sell && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Reason to Sell</p>
              <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap">{item.reason_to_sell}</p>
            </div>
          )}

        </Card>
      )
      }
      <div className="flex justify-end gap-2 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={() => navigate(`/items/${item.id}/edit`)}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          Edit
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          className="bg-red-600 text-white hover:bg-red-700"
        >
          Delete
        </Button>
      </div>



      {/* Metadata */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div>
            <p>Created: {format(new Date(item.created_at), 'MMM dd, yyyy HH:mm')}</p>
          </div>
          <div>
            <p>Updated: {format(new Date(item.updated_at), 'MMM dd, yyyy HH:mm')}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
