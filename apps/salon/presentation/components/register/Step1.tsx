import { Button } from '@zyra/ui/components/button';
import { Input } from '@zyra/ui/components/input';
import { FieldValues, UseFormHandleSubmit, UseFormRegister } from 'react-hook-form';

interface Step1Props {
  handleSubmit: UseFormHandleSubmit<FieldValues>;
  register: UseFormRegister<FieldValues>;
  onSubmit: (data: FieldValues) => void;
  loading: boolean;
  errors: any;
}

export default function Step1({ handleSubmit, register, onSubmit, loading, errors }: Step1Props) {
  return (
    <div className="w-full space-y-4 lg:space-y-6">
      <div className="text-center mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Inscription</h1>
        <p className="text-sm text-gray-600">Créez votre compte pour commencer</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 lg:space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Adresse Email</label>
          <Input
            type="email"
            placeholder="exemple@domaine.com"
            className="w-full h-10 lg:h-12 bg-gray-50 border border-gray-300 rounded-lg text-black dark:text-black focus:text-black focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            {...register('salon.email', { required: true })}
          />
          {errors?.salon?.email && (
            <p className="text-xs text-red-500 mt-1">L'adresse e-mail est requise</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-10 lg:h-12 bg-black hover:bg-gray-800 text-white rounded-lg font-medium text-sm lg:text-base transition-colors"
          disabled={loading}
        >
          {loading ? 'Chargement...' : 'Continuez avec cet email'}
        </Button>

        
      </form>

      <div className="mt-4 lg:mt-6 text-center">
        <a href="/" className="text-sm text-blue-600 hover:underline">
          Retour à la page de connexion
        </a>
      </div>
    </div>
  );
}
