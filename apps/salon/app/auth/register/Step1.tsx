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
            {...register('email', { required: true })}
          />
          {errors?.email && (
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

        <div className="flex items-center my-4 lg:my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">OU</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            className="w-full h-10 lg:h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm lg:text-base transition-colors flex items-center justify-center gap-3"
          >
            <svg
              className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span className="truncate">Continuer avec Facebook</span>
          </Button>

          <Button
            type="button"
            className="w-full h-10 lg:h-12 bg-gray-800 hover:bg-black text-white rounded-lg font-medium text-sm lg:text-base transition-colors flex items-center justify-center gap-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.1 0 5.9 1.1 8.1 3.1l6-6C34.6 3.5 29.6 1.5 24 1.5 14.8 1.5 7.1 7.4 4.2 15.1l7.1 5.5C12.9 14.1 17 9.5 24 9.5z"
              />
              <path
                fill="#34A853"
                d="M46.5 24c0-1.6-.2-3.2-.5-4.7H24v9h12.7c-.5 2.5-1.9 4.6-3.9 6.1l6.1 4.7c3.6-3.3 5.6-8.1 5.6-14.1z"
              />
              <path
                fill="#4A90E2"
                d="M10.2 28.6c-1-2.5-1.6-5.2-1.6-8.1s.6-5.6 1.6-8.1L3.1 7.4C1.1 11 0 15.3 0 20s1.1 9 3.1 12.6l7.1-4z"
              />
              <path
                fill="#FBBC05"
                d="M24 46.5c5.6 0 10.6-1.9 14.1-5.2l-6.1-4.7c-2 1.3-4.5 2.1-8 2.1-7 0-11.1-4.6-12.9-10.6l-7.1 5.5C7.1 40.6 14.8 46.5 24 46.5z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            <span className="truncate">Continuer avec Google</span>
          </Button>
        </div>
      </form>

      <div className="mt-4 lg:mt-6 text-center">
        <a href="/" className="text-sm text-blue-600 hover:underline">
          Retour à la page de connexion
        </a>
      </div>
    </div>
  );
}
