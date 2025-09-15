'use client'
import Image from 'next/image'
import { useForm, FieldValues } from 'react-hook-form';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Step1 from '../../../presentation/components/register/Step1';
import Step2 from '../../../presentation/components/register/Step2';
import Step3 from '../../../presentation/components/register/Step3';
import { ChevronLeft } from 'lucide-react';
import { AuthSalonOwner, checkEmailSalonAlreadyExists, checkOwnerExists, registerSalon } from '@/services/SalonServices';
import { IRegisterSalon } from '@zyra/conf/domain/entities/salons.entities';
import { IRegisterOwner } from '@zyra/conf/domain/entities/owners.entities';
import { authSalonProcess } from '@/services/AuthService';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [ownerExists, setOwnerExists] = useState(false);
  const { register, handleSubmit, setValue, watch, setError, formState: { errors,  } } = useForm();
  const router = useRouter();

  const handleEmailSubmit = async (data: FieldValues) => {
    setLoading(true);
    try {
      setTimeout(() => {
        setLoading(false);
        setStep(2);
      }, 700);
    } catch (error) {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
      setLoading(false);
    }
  };

  const handleOwnerSubmit = async (data: FieldValues) => {
    setLoading(true);
    try {
      const ownerExist = await checkOwnerExists(data.email);
      if (ownerExist) {
          setError('email', {
           type: 'manual',
           message: 'Un propriétaire avec cet email existe déjà. Veuillez utiliser un autre email.',
          });
          toast.error('Un propriétaire avec cet email existe déjà.');
          router.push('/auth/login')
        setLoading(false);
        setOwnerExists(true);
        return ;
      }
      setStep(3);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
      setLoading(false);
    }
  };

  const handleSubmitSalonDetails = async (data: FieldValues) => {
    setLoading(true);
    try {
       const salonEmailExist = await checkEmailSalonAlreadyExists(data.salon.email);
       if (salonEmailExist) {
         setError('salon.email', {
           type: 'manual',
           message: 'Un salon avec cet email existe déjà. Veuillez utiliser un autre email.',
         });
         setLoading(false);
         return ;
       }
       const salon : IRegisterSalon = data.salon;
       const owner : IRegisterOwner = {
         name: data.name,
         email: data.email,
         phone: data.phone,
         password: data.password,
         photo: data.photo,
       };
       const ownerAuth = await registerSalon({salon, owner});
       const loginOwner = await AuthSalonOwner( ownerAuth.password, ownerAuth.email);
       await authSalonProcess(loginOwner.owner, loginOwner.salons);
       setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error('Impossible de terminer l\'inscription.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-zinc-50">
      
      {/* Left: image blurred with dark overlay (visible on lg) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0">
          <Image
            src={ step === 1 ? '/images/register.jpg' : '/images/register2.jpg' }
            alt="Inscription Zyra"
            fill
            sizes="50vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-center items-start px-16 py-24 text-white">
          <div className="max-w-lg">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              {step === 1 ? 'Démarrez avec Zyra' : step === 2 ? 'Créez votre espace propriétaire' : 'Finalisez votre salon'}
            </h2>
            <p className="text-zinc-200 mb-6">
              {step === 1
                ? "Rejoignez des milliers de salons qui gèrent rendez-vous, clients et paiements depuis une seule plateforme."
                : step === 2
                ? "Renseignez vos informations personnelles pour sécuriser votre compte."
                : "Ajoutez les détails du salon pour lancer votre activité en ligne."}
            </p>

            <ul className="space-y-3 text-zinc-200">
              <li className="flex items-start gap-3">
                <span className="inline-block mt-1 h-3 w-3 rounded-full bg-zinc-300/80" />
                <span>Edition des rendez-vous simplifiée</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block mt-1 h-3 w-3 rounded-full bg-zinc-300/80" />
                <span>Profil client et historique</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block mt-1 h-3 w-3 rounded-full bg-zinc-300/80" />
                <span>Facturation et rapports</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 text-sm text-zinc-300 z-10">
          © {new Date().getFullYear()} Zyra
        </div>
      </div>

      {/* Right: centered card form */}
      <div className="w-full lg:w-1/2 h-screen flex items-center justify-center overflow-y-auto p-6 md:p-12">
        <div className="w-full max-w-xl">
          <div className="  ">
            <div className="p-8 md:p-10">
              <div className="text-center mb-6">
                <div className="mx-auto h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-white">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7a4 4 0 100-8 4 4 0 000 8z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-semibold text-zinc-900 mt-4">Créer votre compte Zyra</h1>
                <p className="text-sm text-zinc-600 mt-2">Simple, rapide et sécurisé — commencez en quelques étapes.</p>
              </div>
              {step > 1 && (
                <button
                  onClick={() => setStep(prev => prev - 1)}
                  className="fixed top-4 left-4 z-30 p-2 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white shadow-md transition-all"
                  aria-label="Revenir en arrière"
                >
                  <ChevronLeft color='black' size={18} />
                </button>
              )}

              <div className="space-y-4">
                {step === 1 && (
                  <Step1
                    handleSubmit={handleSubmit}
                    register={register}
                    onSubmit={handleEmailSubmit}
                    loading={loading}
                    errors={errors}
                  />
                )}
                {step === 2 && (
                  <Step2
                    handleSubmit={handleSubmit}
                    register={register}
                    onSubmit={handleOwnerSubmit}
                    loading={loading}
                    setValue={setValue}
                    watch={watch}
                    errors={errors}
                    onBack={() => setStep(1)}
                  />
                )}
                {step === 3 && (
                  <Step3
                    handleSubmit={handleSubmit}
                    register={register}
                    onSubmit={handleSubmitSalonDetails}
                    setValue={setValue}
                    loading={loading}
                    errors={errors}
                    onBack={() => setStep(2)}
                  />
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-zinc-50 flex items-center justify-between">
              <div className="text-sm text-zinc-600">
                Besoin d'aide ? <button onClick={() => router.push('/support')} className="text-zinc-800 font-medium hover:underline">Contactez-nous</button>
              </div>
              <div className="text-sm text-zinc-500">
                Déjà inscrit ? <button onClick={() => router.push('/auth/login')} className="text-zinc-800 font-medium hover:underline">Se connecter</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
