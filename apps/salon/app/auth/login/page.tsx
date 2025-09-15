'use client'
import { Button } from "@zyra/ui/components/button";
import { Input } from "@zyra/ui/components/input";
import { useForm, FieldValues } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, LogIn } from "lucide-react";
import { useRouter } from 'next/navigation';
import { ownerAuthService } from "@/services/ownerAuthService";
import Link from "next/link";
import Image from "next/image";

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
      const { email, password } = data;
      const user = await ownerAuthService.login(email, password);
      const subscriptionStatus = await ownerAuthService.checkSubscriptionStatus(user.uid);
      toast.success("Connexion réussie");
      if (!subscriptionStatus.hasSubscription) {
        toast.info(subscriptionStatus.message);
      }
      router.push(subscriptionStatus.redirectTo);
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue. Veuillez réessayer.");
      console.error("Erreur de connexion:", error.originalError || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-zinc-100">
      {/* Colonne de gauche - Branding avec image de fond */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        {/* Image de fond avec effet blur */}
        <div className="absolute inset-0">
          <Image 
            src="/images/salon-background.jpg" 
            alt="Salon de beauté"
            fill
            sizes="50vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-zinc-900/70 backdrop-blur-sm"></div>
        </div>
        
        {/* Contenu de la colonne de gauche */}
        <div className="relative h-full flex flex-col justify-between text-white z-10">
          <div className="p-12">
            <div className="text-2xl font-bold text-white">Zyra</div>
          </div>
          
          <div className="p-12 space-y-6">
            <h1 className="text-4xl font-bold text-white">Gérez votre salon de beauté avec simplicité.</h1>
            <p className="text-lg text-zinc-200">
              Planification, gestion des clients et facturation - tout ce dont vous avez besoin en un seul endroit.
            </p>
            
            <div className="pt-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-zinc-800/80 p-2 rounded-full">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-lg text-zinc-100">Réservations en ligne 24/7</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-zinc-800/80 p-2 rounded-full">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-lg text-zinc-100">Gestion complète des clients</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-zinc-800/80 p-2 rounded-full">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-lg text-zinc-100">Analyses et statistiques détaillées</span>
              </div>
            </div>
          </div>
          
          <div className="p-12">
            <p className="text-sm text-zinc-300">
              © {new Date().getFullYear()} Zyra. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>

      {/* Colonne de droite - Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mb-2 flex justify-center">
              <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-white">
                <LogIn size={24} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-zinc-800">Connexion</h2>
            <p className="text-zinc-600 mt-2">Bienvenue ! Connectez-vous à votre compte.</p>
          </div>
          
          <form onSubmit={handleSubmit(handleAuth)} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-zinc-700">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 h-5 w-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@domaine.com"
                  className="pl-10 py-5 bg-white border-zinc-300 text-zinc-800 placeholder:text-zinc-400 focus-visible:ring-zinc-400 focus-visible:border-zinc-400"
                  {...register("email", { 
                    required: "L'adresse e-mail est requise",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "L'adresse e-mail est invalide"
                    }
                  })}
                />
              </div>
              {errors?.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message as string}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-zinc-700">
                  Mot de passe
                </label>
                <button
                  type="button"
                  onClick={() => router.push('/auth/forgot-password')}
                  className="text-sm text-zinc-600 hover:text-zinc-900 hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 h-5 w-5" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 py-5 bg-white border-zinc-300 text-zinc-800 placeholder:text-zinc-400 focus-visible:ring-zinc-400 focus-visible:border-zinc-400"
                  {...register("password", { 
                    required: "Le mot de passe est requis",
                    minLength: {
                      value: 6,
                      message: "Le mot de passe doit contenir au moins 6 caractères"
                    }
                  })}
                />
              </div>
              {errors?.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password.message as string}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                className="rounded bg-white border-zinc-300 text-zinc-800"
              />
              <label
                htmlFor="remember"
                className="text-sm text-zinc-600 leading-none"
              >
                Se souvenir de moi
              </label>
            </div>
            
            <Button
              type="submit"
              className="w-full py-6 bg-zinc-800 hover:bg-zinc-700 text-white"
              disabled={loading}
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-zinc-500">Ou continuer avec</span>
              </div>
            </div>

           
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-zinc-600">
              Pas encore de compte ?{" "}
              <button 
                onClick={() => router.push('/auth/register')}
                className="text-zinc-800 hover:underline font-medium"
              >
                Créer un compte
              </button>
            </p>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              En vous connectant, vous acceptez nos{" "}
              <Link href="/legal/terms" className="text-zinc-700 hover:underline">
                conditions d'utilisation
              </Link>{" "}
              et notre{" "}
              <Link href="/legal/privacy" className="text-zinc-700 hover:underline">
                politique de confidentialité
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
