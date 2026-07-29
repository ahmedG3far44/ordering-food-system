import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { restaurantService } from '../api/restaurants';
import type { Restaurant, MenuItem } from '../types';
import { useAuthStore } from '../store/authStore';
import { getCurrencySymbol, convertPrice } from '../utils/currency';
import { Plus, Trash2, Edit, ArrowLeft, UtensilsCrossed } from 'lucide-react';
import ImageUploader from '../components/shared/ImageUploader';
import { toast } from 'sonner';
import { usePageMeta } from '../hooks/usePageMeta';

const imagePlaceholder = 'https://imgs.search.brave.com/YZ1SjLQxhbj0Pd5D19P6s61NQ7GMYKNHOnjLmt8DrdQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/c2hvcGlmeS5jb20v/cy9maWxlcy8xLzA1/MzMvMjA4OS9maWxl/cy9wbGFjZWhvbGRl/ci1pbWFnZXMtaW1h/Z2VfbGFyZ2UucG5n/P3Y9MTUzMDEyOTA4/MQ';

interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
}

function validateMenuItem(name: string, description: string, price: string): FormErrors {
  const errors: FormErrors = {};
  if (!name.trim()) {
    errors.name = 'Item name is required';
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
  if (!description.trim()) {
    errors.description = 'Description is required';
  } else if (description.trim().length < 10) {
    errors.description = 'Please provide a more detailed description';
  }
  if (!price.trim()) {
    errors.price = 'Price is required';
  } else if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
    errors.price = 'Price must be a positive number';
  }
  return errors;
}

const OwnerMenuPage = () => {
  usePageMeta({
    title: 'Menu Management - Urban Bistro',
    description: 'Add, edit, and manage your restaurant menu items, descriptions, pricing, and images. Organize your food offerings with the Urban Bistro menu manager.',
    keywords: 'menu management, restaurant menu, edit menu items, food pricing, menu editor, restaurant owner menu',
  });

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', imageUrl: '' });
  const [editItem, setEditItem] = useState({ name: '', description: '', price: '', imageUrl: '' });
  const [newItemErrors, setNewItemErrors] = useState<FormErrors>({});
  const [editItemErrors, setEditItemErrors] = useState<FormErrors>({});
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const restaurantIdParam = searchParams.get('restaurant');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await restaurantService.getMy();
        setRestaurants(data);

        let restaurantToSelect: Restaurant | undefined;

        if (restaurantIdParam) {
          restaurantToSelect = data.find(r => (r._id || r.id) === restaurantIdParam);
        }

        if (!restaurantToSelect && data.length > 0) {
          restaurantToSelect = data[0];
        }

        if (restaurantToSelect) {
          setSelectedRestaurant(restaurantToSelect);
          const menu = await restaurantService.getMenu(restaurantToSelect._id || restaurantToSelect.id);
          setMenuItems(menu);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchData();
  }, [user, restaurantIdParam]);

  const handleSelectRestaurant = async (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    try {
      const menu = await restaurantService.getMenu(restaurant._id || restaurant.id);
      setMenuItems(menu);
    } catch (error) {
      console.error('Failed to fetch menu:', error);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant) return;

    const errors = validateMenuItem(newItem.name, newItem.description, newItem.price);
    setNewItemErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const restaurantId = selectedRestaurant._id || selectedRestaurant.id;
    setIsAdding(true);
    try {
      const created = await restaurantService.addMenuItem(restaurantId, {
        name: newItem.name,
        description: newItem.description,
        price: parseFloat(newItem.price),
        imageUrl: newItem.imageUrl || undefined,
      });
      setMenuItems([...menuItems, created]);
      setNewItem({ name: '', description: '', price: '', imageUrl: '' });
      setNewItemErrors({});
      setShowAddForm(false);
      toast.success('Menu item added successfully');
    } catch (error) {
      console.error('Failed to add item:', error);
      toast.error('Failed to add item');
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setEditItem({
      name: item.name,
      description: item.description || '',
      price: String(convertPrice(item.price)),
      imageUrl: item.imageUrl || '',
    });
    setEditItemErrors({});
    setShowEditForm(true);
  };

  const handleDeleteItem = async (item: MenuItem) => {
    if (!selectedRestaurant) return;
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    const restaurantId = selectedRestaurant._id || selectedRestaurant.id;
    const itemId = item._id || item.id;

    try {
      await restaurantService.deleteMenuItem(restaurantId, itemId);
      setMenuItems(menuItems.filter(i => (i._id || i.id) !== itemId));
      toast.success('Menu item deleted');
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant || !editingItem) return;

    const errors = validateMenuItem(editItem.name, editItem.description, editItem.price);
    setEditItemErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const restaurantId = selectedRestaurant._id || selectedRestaurant.id;
    const itemId = editingItem._id || editingItem.id;
    setIsSaving(true);
    try {
      const updated = await restaurantService.updateMenuItem(restaurantId, itemId, {
        name: editItem.name,
        description: editItem.description,
        price: parseFloat(editItem.price),
        imageUrl: editItem.imageUrl || undefined,
      });
      setMenuItems(menuItems.map(i => (i._id || i.id) === itemId ? { ...i, ...updated } : i));
      setShowEditForm(false);
      setEditingItem(null);
      setEditItem({ name: '', description: '', price: '', imageUrl: '' });
      setEditItemErrors({});
      toast.success('Menu item updated');
    } catch (error) {
      console.error('Failed to update item:', error);
      toast.error('Failed to update item');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setShowEditForm(false);
    setEditingItem(null);
    setEditItem({ name: '', description: '', price: '', imageUrl: '' });
    setEditItemErrors({});
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 font-mono text-center">
        <p className="text-slate-500 mb-4">Please login to manage menu.</p>
        <Link to="/login" className="nb-button bg-primary text-white px-6 py-2">Login</Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 font-mono">
        <div className="bg-slate-100 border-3 border-primary h-16 animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-100 border-3 border-primary h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 font-mono text-center">
        <UtensilsCrossed size={64} className="text-slate-300 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-primary uppercase mb-4">No restaurants</h2>
        <p className="text-slate-500 mb-8">You don't own any restaurants yet.</p>
        <Link to="/owner/dashboard" className="nb-button bg-primary text-white px-6 py-2">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <Link
        to="/owner/dashboard"
        className="inline-flex items-center gap-2 text-sm font-bold text-primary mb-8 hover:underline"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-black text-primary uppercase font-mono">Menu Management</h1>
        {selectedRestaurant && (
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase">{selectedRestaurant.name}</p>
            <p className="text-lg font-black text-primary">{menuItems.length} items</p>
          </div>
        )}
      </div>

      {(restaurants.length > 1 || selectedRestaurant) && (
        <div className="flex justify-start items-center gap-2 mb-8 flex-wrap pb-2">
          {restaurants.length === 1 && selectedRestaurant && (
            <div className="px-4 py-2 border-2 border-primary bg-primary text-white font-bold text-sm uppercase flex items-center gap-2">
              <UtensilsCrossed size={14} />
              {selectedRestaurant.name}
              <span className="opacity-75">({menuItems.length} items)</span>
            </div>
          )}
          {restaurants.length > 1 && restaurants.map((res) => {
            const isSelected = selectedRestaurant?.id === res.id;
            return (
              <button
                key={res?.id || res?._id}
                onClick={() => handleSelectRestaurant(res)}
                className={`cursor-pointer transition-all duration-200 hover:opacity-80 px-4 py-2 border-2 font-bold text-sm uppercase whitespace-nowrap flex items-center gap-2 ${isSelected
                  ? 'bg-primary text-white border-primary shadow-lg'
                  : 'border-slate-200 text-slate-500 hover:border-primary hover:bg-slate-50'
                }`}
              >
                {isSelected && <UtensilsCrossed size={14} />}
                {res.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="mb-8">
        {showAddForm ? (
          <form onSubmit={handleAddItem} className="bg-white border-3 border-primary nb-shadow p-6 font-mono max-w-xl" noValidate>
            <h3 className="text-lg font-black text-primary uppercase mb-4">Add New Item</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-primary uppercase mb-1">Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => { setNewItem({ ...newItem, name: e.target.value }); if (newItemErrors.name) setNewItemErrors({ ...newItemErrors, name: undefined }); }}
                  className={`w-full border-2 p-3 outline-none focus:bg-primary/5 ${newItemErrors.name ? 'border-red-500' : 'border-primary'}`}
                  required
                />
                {newItemErrors.name && <p className="text-red-500 text-[10px] mt-1 font-bold">{newItemErrors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-primary uppercase mb-1">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => { setNewItem({ ...newItem, description: e.target.value }); if (newItemErrors.description) setNewItemErrors({ ...newItemErrors, description: undefined }); }}
                  className={`w-full border-2 p-3 outline-none focus:bg-primary/5 h-20 ${newItemErrors.description ? 'border-red-500' : 'border-primary'}`}
                  required
                />
                {newItemErrors.description && <p className="text-red-500 text-[10px] mt-1 font-bold">{newItemErrors.description}</p>}
              </div>
              <ImageUploader
                currentUrl={newItem.imageUrl}
                onUploadComplete={(url) => setNewItem({ ...newItem, imageUrl: url })}
                onClear={() => setNewItem({ ...newItem, imageUrl: '' })}
              />
              <div>
                <label className="block text-xs font-bold text-primary uppercase mb-1">Price ({getCurrencySymbol(selectedRestaurant?.currency)})</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => { setNewItem({ ...newItem, price: e.target.value }); if (newItemErrors.price) setNewItemErrors({ ...newItemErrors, price: undefined }); }}
                  className={`w-full border-2 p-3 outline-none focus:bg-primary/5 ${newItemErrors.price ? 'border-red-500' : 'border-primary'}`}
                  required
                />
                {newItemErrors.price && <p className="text-red-500 text-[10px] mt-1 font-bold">{newItemErrors.price}</p>}
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                disabled={isAdding}
                className="nb-button bg-primary text-white px-6 py-2 disabled:opacity-50"
              >
                {isAdding ? 'Adding...' : 'Add Item'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewItem({ name: '', description: '', price: '', imageUrl: '' });
                  setNewItemErrors({});
                  setShowAddForm(false);
                }}
                className="px-6 py-2 border-2 border-slate-200 text-slate-500 hover:border-primary"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="nb-button bg-primary text-white px-6 py-2 flex items-center gap-2"
          >
            <Plus size={18} /> Add Menu Item
          </button>
        )}
      </div>

      {showEditForm && editingItem && (
        <form onSubmit={handleUpdateItem} className="bg-white border-3 border-primary nb-shadow p-6 font-mono max-w-xl mb-8" noValidate>
          <h3 className="text-lg font-black text-primary uppercase mb-4">Edit Item</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-primary uppercase mb-1">Name</label>
              <input
                type="text"
                value={editItem.name}
                onChange={(e) => { setEditItem({ ...editItem, name: e.target.value }); if (editItemErrors.name) setEditItemErrors({ ...editItemErrors, name: undefined }); }}
                className={`w-full border-2 p-3 outline-none focus:bg-primary/5 ${editItemErrors.name ? 'border-red-500' : 'border-primary'}`}
                required
              />
              {editItemErrors.name && <p className="text-red-500 text-[10px] mt-1 font-bold">{editItemErrors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-primary uppercase mb-1">Description</label>
              <textarea
                value={editItem.description}
                onChange={(e) => { setEditItem({ ...editItem, description: e.target.value }); if (editItemErrors.description) setEditItemErrors({ ...editItemErrors, description: undefined }); }}
                className={`w-full border-2 p-3 outline-none focus:bg-primary/5 h-20 ${editItemErrors.description ? 'border-red-500' : 'border-primary'}`}
                required
              />
              {editItemErrors.description && <p className="text-red-500 text-[10px] mt-1 font-bold">{editItemErrors.description}</p>}
            </div>
            <ImageUploader
              currentUrl={editItem.imageUrl}
              onUploadComplete={(url) => setEditItem({ ...editItem, imageUrl: url })}
              onClear={() => setEditItem({ ...editItem, imageUrl: '' })}
            />
            <div>
              <label className="block text-xs font-bold text-primary uppercase mb-1">Price ({getCurrencySymbol(selectedRestaurant?.currency)})</label>
              <input
                type="number"
                step="0.01"
                value={editItem.price}
                onChange={(e) => { setEditItem({ ...editItem, price: e.target.value }); if (editItemErrors.price) setEditItemErrors({ ...editItemErrors, price: undefined }); }}
                className={`w-full border-2 p-3 outline-none focus:bg-primary/5 ${editItemErrors.price ? 'border-red-500' : 'border-primary'}`}
                required
              />
              {editItemErrors.price && <p className="text-red-500 text-[10px] mt-1 font-bold">{editItemErrors.price}</p>}
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={isSaving}
              className="nb-button bg-primary text-white px-6 py-2 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Update Item'}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="px-6 py-2 border-2 border-slate-200 text-slate-500 hover:border-primary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div key={item?.id || item?._id} className="bg-white border-3 border-primary nb-shadow-sm p-4">
            <div className="border-2 border-slate-200 mb-4 bg-slate-100">
              <img
                src={item?.imageUrl ? item.imageUrl : imagePlaceholder}
                alt={item.name}
                className="w-full block"
              />
            </div>
            <h3 className="font-black text-primary uppercase">{item.name}</h3>
            <p className="text-slate-500 text-sm line-clamp-2 mb-2">{item.description}</p>
            <div className="flex justify-between items-center">
              <p className="font-black text-primary text-lg">{getCurrencySymbol(selectedRestaurant?.currency)}{convertPrice(item.price)}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditItem(item)}
                  className="p-2 border-2 border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteItem(item)}
                  className="p-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {menuItems.length === 0 && (
        <p className="text-slate-500 text-center py-8">No menu items yet. Add your first item!</p>
      )}
    </main>
  );
};

export default OwnerMenuPage;
