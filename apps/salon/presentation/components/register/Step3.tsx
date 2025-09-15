import { Button } from '@zyra/ui/components/button';
import { Input } from '@zyra/ui/components/input';
import { FieldValues, UseFormHandleSubmit, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import SalonLocationForm from '../SalonLocationForm';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCollection } from '@zyra/conf/lib/query';
import { where } from 'firebase/firestore';
import SalonGallery from '../SalonGallery';

interface LocationData {
  address: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
}

interface Step3Props {
  handleSubmit: UseFormHandleSubmit<FieldValues>;
  register: UseFormRegister<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
  onSubmit: (data: FieldValues) => void;
  loading: boolean;
  errors: any;
  onBack: () => void;
}

export default function Step3({ handleSubmit, register, setValue, onSubmit, loading, errors, onBack }: Step3Props) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  // Fetch salon categories (actives)
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['salon-categories'],
    queryFn: async () => {
      const res = await fetchCollection('salon_categories', [where("active", "==", true)])
      return res.filter((cat: any) => cat.active !== false)
    },
    refetchOnWindowFocus: true,
  })

  // Fetch countries (actives)
  const { data: countries = [], isLoading: loadingCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const res = await fetchCollection('countries', [where("active", "==", true)])
      return res.filter((c: any) => c.active !== false)
    },
    refetchOnWindowFocus: true,
  })

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
    setValue('salon.category', value);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCountry(value);
    setValue('salon.country', value);
  };

  const handleFormSubmit = (data: FieldValues) => {
    onSubmit(data);
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Informations du salon</h1>
        <p className="text-sm text-gray-600">Configurez votre salon pour finaliser votre inscription</p>
      </div>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 lg:space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom du salon *</label>
            <Input
              type="text"
              placeholder="Ex: Salon Prestige"
              className="w-full h-10 lg:h-12 bg-gray-50 border text-black border-gray-300 rounded-lg focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-sm lg:text-base"
              {...register('salon.name', { required: true })}
            />
            {errors?.salon?.name && (
              <p className="text-xs text-red-500 mt-1">Le nom est requis</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
            <Input
              type="tel"
              placeholder="Ex: +237 6 99 99 99 99"
              className="w-full h-10 lg:h-12 text-black bg-gray-50 border border-gray-300 rounded-lg focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-sm lg:text-base"
              {...register('salon.phone', { required: true })}
            />
            {errors?.salon?.phone && (
              <p className="text-xs text-red-500 mt-1">Le numéro de téléphone est requis</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email professionnel</label>
          <Input
            type="email"
            placeholder="Ex: contact@salonprestige.com"
            className="w-full h-10 lg:h-12 disabled:bg-gray-700 text-black bg-gray-50 border border-gray-300 rounded-lg focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-sm lg:text-base"
            {...register('salon.email')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie du salon *</label>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full h-10 lg:h-12 text-black bg-gray-50 border border-gray-300 rounded-lg focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-sm lg:text-base"
              disabled={loadingCategories}
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors?.category && (
              <p className="text-xs text-red-500 mt-1">La catégorie est requise</p>
            )}
          </div>

          {/* Country Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pays *</label>
            <select
              value={selectedCountry}
              onChange={handleCountryChange}
              className="w-full h-10 lg:h-12 text-black bg-gray-50 border border-gray-300 rounded-lg focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-sm lg:text-base"
              disabled={loadingCountries}
            >
              <option value="">Sélectionnez un pays</option>
              {countries.map((country: any) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
            {errors?.country && (
              <p className="text-xs text-red-500 mt-1">Le pays est requis</p>
            )}
          </div>
        </div>

        {/* Gallery Section */}
        <div className="pt-2 lg:pt-4">
          <SalonGallery onGalleryChange={(files) => setValue('salon.photos', files)} />
        </div>

        <div className="pt-4 lg:pt-6">
          <Button
            type="submit"
            className="w-full h-10 lg:h-12 bg-black hover:bg-gray-800 text-white rounded-lg font-medium text-sm lg:text-base transition-colors"
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'Finaliser l\'inscription'}
          </Button>
        </div>
      </form>
    </div>
  );
}
