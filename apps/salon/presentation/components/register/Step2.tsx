import { Button } from '@zyra/ui/components/button';
import { Input } from '@zyra/ui/components/input';
import { FieldValues, UseFormHandleSubmit, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { useState } from 'react';

interface Step2Props {
  handleSubmit: UseFormHandleSubmit<FieldValues>;
  register: UseFormRegister<FieldValues>;
  onSubmit: (data: FieldValues) => void;
  setValue: UseFormSetValue<FieldValues>;
  watch: UseFormWatch<FieldValues>;
  loading: boolean;
  errors: any;
  onBack: () => void;
}

export default function Step2({ handleSubmit, register, onSubmit, setValue, watch, loading, errors, onBack }: Step2Props) {
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const password = watch('password');

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setProfilePhoto(event.target.files[0]);
      setValue('photo', event.target.files[0]);
    }
  };

  const removePhoto = () => {
    setProfilePhoto(null);
  };

  return (
    <div className="w-full space-y-4 lg:space-y-6">
      <div className="text-center mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Informations du propriétaire</h1>
        <p className="text-sm text-gray-600">Renseignez vos informations personnelles</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 lg:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
            <Input
              type="text"
              placeholder="Votre nom complet"
              className="w-full h-10 lg:h-12 bg-gray-50 text-black dark:text-black focus:text-black border border-gray-300 rounded-lg focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-sm lg:text-base"
              {...register('name', { required: true })}
            />
            {errors?.name && (
              <p className="text-xs text-red-500 mt-1">Le nom est requis</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
            <Input
              type="tel"
              placeholder="Numéro de téléphone"
              className="w-full h-10 lg:h-12 text-black dark:text-black focus:text-black bg-gray-50 border border-gray-300 rounded-lg focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-sm lg:text-base"
              {...register('phone', { required: true })}
            />
            {errors?.phone && (
              <p className="text-xs text-red-500 mt-1">Le numéro de téléphone est requis</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <Input
            type="email"
            placeholder="Votre adresse email"
            className="w-full h-10 lg:h-12 text-black dark:text-black focus:text-black bg-gray-50 border border-gray-300 rounded-lg focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-sm lg:text-base"
            {...register('email', { 
              required: "L'email est requis",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "L'adresse email n'est pas valide"
              }
            })}
          />
          {errors?.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe *</label>
          <Input
            type="password"
            placeholder="Créer un mot de passe"
            className="w-full h-10 lg:h-12 text-black dark:text-black focus:text-black bg-gray-50 border border-gray-300 rounded-lg focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-sm lg:text-base"
            {...register('password', { 
              required: "Le mot de passe est requis",
              minLength: {
                value: 8,
                message: "Le mot de passe doit contenir au moins 8 caractères"
              }
            })}
          />
          {errors?.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe *</label>
          <Input
            type="password"
            placeholder="Confirmer votre mot de passe"
            className="w-full h-10 lg:h-12 text-black dark:text-black focus:text-black bg-gray-50 border border-gray-300 rounded-lg focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-sm lg:text-base"
            {...register('confirmPassword', { 
              required: "La confirmation du mot de passe est requise",
              validate: value => 
                value === password || "Les mots de passe ne correspondent pas"
            })}
          />
          {errors?.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Photo de profil</label>
          <div className="space-y-3 lg:space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="block w-full text-xs sm:text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-colors sm:file:text-sm"
            />
            {profilePhoto && (
              <div className="flex flex-col items-center space-y-2 lg:space-y-3">
                <img
                  src={URL.createObjectURL(profilePhoto)}
                  alt="Aperçu de la photo de profil"
                  className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full object-cover border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="text-xs sm:text-sm text-red-500 hover:text-red-700 hover:underline transition-colors"
                >
                  Retirer la photo
                </button>
              </div>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-10 lg:h-12 bg-black hover:bg-gray-800 text-white rounded-lg font-medium text-sm lg:text-base transition-colors"
          disabled={loading}
        >
          {loading ? 'Chargement...' : 'Continuer'}
        </Button>
      </form>
    </div>
  );
}
