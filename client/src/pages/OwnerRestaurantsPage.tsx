import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { restaurantService } from '../api/restaurants';
import type { Restaurant, CreateRestaurantInput } from '../types';
import { useAuthStore } from '../store/authStore';
import { PLACEHOLDER_IMAGES, handleImageError } from '../utils/constants';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Store, ArrowLeft, MapPin, Utensils } from 'lucide-react';
import ImageUploader from '../components/shared/ImageUploader';


const COUNTRY_DATA: Record<string, { states: Record<string, string>; currency: string; currencySymbol: string; name: string }> = {
  US: {
    name: 'United States',
    states: {
      'CA': 'California', 'NY': 'New York', 'TX': 'Texas', 'FL': 'Florida', 'WA': 'Washington',
      'IL': 'Illinois', 'PA': 'Pennsylvania', 'OH': 'Ohio', 'GA': 'Georgia', 'NC': 'North Carolina'
    },
    currency: 'USD',
    currencySymbol: '$'
  },
  GB: {
    name: 'United Kingdom',
    states: {
      'ENG': 'England', 'SCT': 'Scotland', 'WLS': 'Wales', 'NIR': 'Northern Ireland'
    },
    currency: 'GBP',
    currencySymbol: '£'
  },
  EU: {
    name: 'European Union',
    states: {
      'DE': 'Germany', 'FR': 'France', 'IT': 'Italy', 'ES': 'Spain', 'NL': 'Netherlands',
      'BE': 'Belgium', 'AT': 'Austria', 'PT': 'Portugal', 'GR': 'Greece', 'IE': 'Ireland'
    },
    currency: 'EUR',
    currencySymbol: '€'
  },
  SA: {
    name: 'Saudi Arabia',
    states: {
      'RIY': 'Riyadh', 'JED': 'Jeddah', 'DMM': 'Dammam', 'MEC': 'Mecca', 'MED': 'Medina'
    },
    currency: 'SAR',
    currencySymbol: 'SAR '
  },
  AE: {
    name: 'United Arab Emirates',
    states: {
      'DXB': 'Dubai', 'AUH': 'Abu Dhabi', 'SHJ': 'Sharjah', 'RAK': 'Ras Al Khaimah'
    },
    currency: 'AED',
    currencySymbol: 'AED '
  },
  EG: {
    name: 'Egypt',
    states: {
      'Cairo': 'Cairo', 'Giza': 'Giza', 'Alexandria': 'Alexandria', 'Mansoura': 'Mansoura',
      'Tanta': 'Tanta', 'Asyut': 'Asyut', 'Suez': 'Suez', 'Zagazig': 'Zagazig'
    },
    currency: 'EGP',
    currencySymbol: 'E£'
  },
  IN: {
    name: 'India',
    states: {
      'DL': 'Delhi', 'MH': 'Maharashtra', 'KA': 'Karnataka', 'TN': 'Tamil Nadu', 'UP': 'Uttar Pradesh',
      'WB': 'West Bengal', 'GJ': 'Gujarat', 'RJ': 'Rajasthan', 'MP': 'Madhya Pradesh', 'KL': 'Kerala'
    },
    currency: 'INR',
    currencySymbol: '₹'
  },
  JP: {
    name: 'Japan',
    states: {
      'Tokyo': 'Tokyo', 'Osaka': 'Osaka', 'Kyoto': 'Kyoto', 'Yokohama': 'Yokohama', 'Nagoya': 'Nagoya'
    },
    currency: 'JPY',
    currencySymbol: '¥'
  },
  CA: {
    name: 'Canada',
    states: {
      'ON': 'Ontario', 'QC': 'Quebec', 'BC': 'British Columbia', 'AB': 'Alberta', 'MB': 'Manitoba'
    },
    currency: 'CAD',
    currencySymbol: 'CA$'
  },
  AU: {
    name: 'Australia',
    states: {
      'NSW': 'New South Wales', 'VIC': 'Victoria', 'QLD': 'Queensland', 'WA': 'Western Australia', 'SA': 'South Australia'
    },
    currency: 'AUD',
    currencySymbol: 'A$'
  }
};

interface FormErrors {
  name?: string;
  streetAddress?: string;
  country?: string;
  state?: string;
}

function validateRestaurantForm(name: string, streetAddress: string, country: string, state: string): FormErrors {
  const errors: FormErrors = {};
  if (!name.trim()) {
    errors.name = 'Restaurant name is required';
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
  if (!country) {
    errors.country = 'Please select a country';
  }
  if (!state) {
    errors.state = 'Please select a state/region';
  }
  if (!streetAddress.trim()) {
    errors.streetAddress = 'Street address is required';
  }
  return errors;
}

const OwnerRestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateRestaurantInput>({
    name: '',
    address: '',
    cuisine: '',
    imageUrl: '',
    description: '',
    currency: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleCountryChange = (countryCode: string) => {
    const country = COUNTRY_DATA[countryCode];
    setSelectedCountry(countryCode);
    setSelectedState('');
    setFormErrors({ ...formErrors, country: undefined, state: undefined });
    setFormData({
      ...formData,
      currency: country?.currency || '',
      address: ''
    });
  };

  const handleStateChange = (stateCode: string) => {
    setSelectedState(stateCode);
    setFormErrors({ ...formErrors, state: undefined });
    const currentStreet = formData.address.split(',').slice(0, -2).join(',').trim();
    const stateName = COUNTRY_DATA[selectedCountry]?.states[stateCode] || stateCode;
    const countryName = COUNTRY_DATA[selectedCountry]?.name || selectedCountry;
    setFormData({
      ...formData,
      address: currentStreet ? `${currentStreet}, ${stateName}, ${countryName}` : `${stateName}, ${countryName}`
    });
  };

  const handleAddressChange = (street: string) => {
    setStreetAddress(street);
    setFormErrors({ ...formErrors, streetAddress: undefined });
    const countryName = COUNTRY_DATA[selectedCountry]?.name || '';
    const stateName = selectedState ? (COUNTRY_DATA[selectedCountry]?.states[selectedState] || '') : '';

    if (street && stateName && countryName) {
      setFormData({ ...formData, address: `${street}, ${stateName}, ${countryName}` });
    } else if (street && countryName) {
      setFormData({ ...formData, address: `${street}, ${countryName}` });
    } else {
      setFormData({ ...formData, address: street });
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [user]);

  const fetchRestaurants = async () => {
    try {
      const data = await restaurantService.getMy();
      setRestaurants(data);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateRestaurantForm(formData.name, streetAddress, selectedCountry, selectedState);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setIsSaving(true);
    try {
      if (editingId) {
        await restaurantService.update(editingId, formData);
        toast.success('Restaurant updated successfully');
      } else {
        await restaurantService.create(formData);
        toast.success('Restaurant created successfully');
      }
      setFormData({ name: '', address: '', cuisine: '', imageUrl: '', description: '' });
      setShowAddForm(false);
      setEditingId(null);
      fetchRestaurants();
    } catch (error) {
      toast.error('Failed to save restaurant');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (restaurant: Restaurant) => {
    setFormData({
      name: restaurant.name,
      address: restaurant.address,
      cuisine: restaurant.cuisine || '',
      imageUrl: restaurant.imageUrl || '',
      description: restaurant.description || '',
      currency: restaurant.currency || 'EGP',
    });
    // Try to detect country from currency for editing
    const countryEntry = Object.entries(COUNTRY_DATA).find(([_, data]) => data.currency === restaurant.currency);
    const countryCode = countryEntry?.[0] || '';
    setSelectedCountry(countryCode);

    // Try to detect state from address
    const countryData = COUNTRY_DATA[countryCode];
    let foundState = '';
    if (countryData) {
      const addressParts = restaurant.address.split(',');
      for (let i = 1; i < addressParts.length; i++) {
        const part = addressParts[i]?.trim();
        if (part) {
          const stateEntry = Object.entries(countryData.states).find(([_, name]) => name === part);
          if (stateEntry) {
            foundState = stateEntry[0];
            break;
          }
        }
      }
    }
    setSelectedState(foundState);

    // Extract street address (first part before state/country)
    const street = restaurant.address.split(',')[0]?.trim() || restaurant.address;
    setStreetAddress(street);
    setEditingId(restaurant._id || restaurant.id);
    setShowAddForm(true);
  };

  const handleDelete = async (restaurant: Restaurant) => {
    const id = restaurant._id || restaurant.id;
    if (!confirm('Are you sure you want to delete this restaurant?')) return;
    try {
      await restaurantService.delete(id);
      toast.success('Restaurant deleted');
      fetchRestaurants();
    } catch (error) {
      toast.error('Failed to delete restaurant');
    }
  };

  const cancelForm = () => {
    setFormData({ name: '', address: '', cuisine: '', imageUrl: '', description: '', currency: 'EGP' });
    setFormErrors({});
    setSelectedCountry('');
    setSelectedState('');
    setStreetAddress('');
    setShowAddForm(false);
    setEditingId(null);
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 font-mono text-center">
        <p className="text-slate-500 mb-4">Please login to manage restaurants.</p>
        <Link to="/login" className="nb-button bg-primary text-white px-6 py-2">Login</Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 font-mono">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-100 border-3 border-primary h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link
        to="/owner/dashboard"
        className="inline-flex items-center gap-2 text-sm font-bold text-primary mb-8 hover:underline"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase font-mono">My Restaurants</h1>
          <p className="text-slate-500 font-mono">Manage your restaurant locations</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="nb-button bg-primary text-white px-6 py-2 flex items-center gap-2"
        >
          <Plus size={18} /> Add Restaurant
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white border-3 border-primary nb-shadow p-6 font-mono mb-12">
          <h3 className="text-lg font-black text-primary uppercase mb-4">
            {editingId ? 'Edit Restaurant' : 'Add New Restaurant'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-primary uppercase mb-1">Restaurant Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if (formErrors.name) setFormErrors({ ...formErrors, name: undefined }); }}
                  className={`w-full border-2 p-3 outline-none focus:bg-primary/5 ${formErrors.name ? 'border-red-500' : 'border-primary'}`}
                  required
                />
                {formErrors.name && <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-primary uppercase mb-1">Cuisine Type</label>
                <input
                  type="text"
                  value={formData.cuisine}
                  onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                  className="w-full border-2 border-primary p-3 outline-none focus:bg-primary/5"
                  placeholder="Italian, Chinese, etc."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-primary uppercase mb-1">Country *</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className={`w-full border-2 p-3 outline-none focus:bg-primary/5 ${formErrors.country ? 'border-red-500' : 'border-primary'}`}
                  required
                >
                  <option value="">Select Country</option>
                  {Object.entries(COUNTRY_DATA).map(([code, data]) => (
                    <option key={code} value={code}>{data.name} ({data.currencySymbol})</option>
                  ))}
                </select>
                {formErrors.country && <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.country}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-primary uppercase mb-1">State/Region *</label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className={`w-full border-2 p-3 outline-none focus:bg-primary/5 ${formErrors.state ? 'border-red-500' : 'border-primary'}`}
                  disabled={!selectedCountry}
                  required
                >
                  <option value="">Select State</option>
                  {selectedCountry && Object.entries(COUNTRY_DATA[selectedCountry]?.states || {}).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
                {formErrors.state && <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.state}</p>}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-primary uppercase mb-1">Street Address *</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  className={`w-full border-2 p-3 outline-none focus:bg-primary/5 ${formErrors.streetAddress ? 'border-red-500' : 'border-primary'}`}
                  placeholder="Street name, building number"
                  required
                />
              </div>
              {formErrors.streetAddress && <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.streetAddress}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-primary uppercase mb-1">Currency (Auto-detected)</label>
              <div className="flex items-center gap-2 bg-slate-100 border-2 border-slate-200 p-3">
                <span className="text-slate-500">{formData.currency} - {COUNTRY_DATA[selectedCountry]?.currencySymbol || '$'}</span>
                <span className="text-xs text-slate-400">(Auto-selected based on country)</span>
              </div>
            </div>
            <ImageUploader
              currentUrl={formData.imageUrl}
              onUploadComplete={(url) => setFormData({ ...formData, imageUrl: url })}
              onClear={() => setFormData({ ...formData, imageUrl: '' })}
            />
            <div>
              <label className="block text-xs font-bold text-primary uppercase mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border-2 border-primary p-3 outline-none focus:bg-primary/5 h-24"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className="nb-button bg-primary text-white px-6 py-2 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="px-6 py-2 border-2 border-slate-200 text-slate-500 hover:border-primary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Restaurants Grid */}
      {restaurants.length === 0 ? (
        <div className="text-center py-16">
          <Store size={64} className="text-slate-300 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-primary uppercase mb-4">No restaurants yet</h2>
          <p className="text-slate-500 mb-8">Create your first restaurant to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="bg-white border-3 border-primary nb-shadow-sm overflow-hidden">
              <div className="h-48 overflow-hidden border-b-3 border-primary bg-slate-100">
                <img
                  src={restaurant.imageUrl || PLACEHOLDER_IMAGES.RESTAURANT}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(e, PLACEHOLDER_IMAGES.RESTAURANT)}
                />
              </div>
              <div className="p-5">
                <h3 className="font-black text-primary uppercase text-lg mb-2">{restaurant.name}</h3>
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                  <MapPin size={14} />
                  <span>{restaurant.address}</span>
                </div>
                {restaurant.cuisine && (
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                    <Utensils size={14} />
                    <span>{restaurant.cuisine}</span>
                  </div>
                )}
                <div className="flex gap-2 pt-4 border-t-2 border-slate-100">
                  <button
                    onClick={() => navigate(`/owner/menu?restaurant=${restaurant._id || restaurant.id}`)}
                    className="flex-1 nb-button bg-primary text-white text-xs py-2"
                  >
                    Manage Menu
                  </button>
                  <button
                    onClick={() => handleEdit(restaurant)}
                    className="p-2 border-2 border-primary text-primary hover:bg-primary hover:text-white"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(restaurant)}
                    className="p-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerRestaurantsPage;