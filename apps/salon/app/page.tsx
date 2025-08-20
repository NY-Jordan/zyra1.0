'use client'
import { Button } from "@zyra/ui/components/button";
import { Input } from "@zyra/ui/components/input";
import { useForm, FieldValues } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { Apple } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleAuth = async (data: FieldValues) => {
    setLoading(true);
    try {
      console.log("Auth data:", data);
      toast.success("Action réussie.");
    } catch (error) {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="flex justify-cente flex-col">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
          Bienvenue
        </h1>
        <form
          onSubmit={handleSubmit(handleAuth)}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse Email
            </label>
            <Input
              type="email"
              placeholder="exemple@domaine.com"
              className="w-full h-12 bg-gray-50 border border-gray-300 rounded-lg focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-base"
              {...register("email", { required: true })}
            />
            {errors?.email && (
              <p className="text-xs text-red-500 mt-1">
                L'adresse e-mail est requise
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de Passe
            </label>
            <Input
              type="password"
              placeholder="Votre mot de passe"
              className="w-full h-12 bg-gray-50 border border-gray-300 rounded-lg focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-base"
              {...register("password", { required: true })}
            />
            {errors?.password && (
              <p className="text-xs text-red-500 mt-1">
                Le mot de passe est requis
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-lg font-medium text-base transition-colors"
            disabled={loading}
          >
            {loading ? "Chargement..." : "Se Connecter"}
          </Button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">OU</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-base transition-colors flex items-center justify-center gap-3"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Continuer avec Facebook
          </Button>

          <Button
            type="button"
            className="w-full h-12 bg-gray-800 hover:bg-black text-white rounded-lg font-medium text-base transition-colors flex items-center justify-center gap-3"
          >
            <Apple className="h-5 w-5" />
            Continuer avec Google
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">Pas encore inscrit ?</p>
          <Button
            type="button"
            onClick={() => router.push('/auth/register')}
            className="mt-2 w-full h-12 bg-gray-800 hover:bg-black text-white rounded-lg font-medium text-base transition-colors"
          >
            Aller à la page d'inscription
          </Button>
        </div>

         <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              En vous connectant, vous acceptez nos{" "}
              <span className="text-indigo-600 dark:text-indigo-400 underline cursor-pointer hover:text-indigo-700 dark:hover:text-indigo-300">
                conditions d'utilisation
              </span>{" "}
              et notre{" "}
              <span className="text-indigo-600 dark:text-indigo-400 underline cursor-pointer hover:text-indigo-700 dark:hover:text-indigo-300">
                politique de confidentialité
              </span>.
            </p>
          </div>
      
      </div>
      <div className="mt-12 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            © {new Date().getFullYear()} Zyra. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}
