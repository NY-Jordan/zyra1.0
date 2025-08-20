'use client'
import { Button } from '@zyra/ui/components/button';
import { Input } from '@zyra/ui/components/input';
import { useForm, FieldValues } from 'react-hook-form';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, ChevronLeft } from 'lucide-react';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const router = useRouter();

  const handleEmailSubmit = async (data: FieldValues) => {
    setLoading(true);
    try {
      console.log('Email submitted:', data.email);
      setTimeout(() => {
        setLoading(false);
        setStep(2);
      }, 1000); // Simulate API call
    } catch (error) {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
      setLoading(false);
    }
  };

  const handleOwnerSubmit = async (data: FieldValues) => {
    setLoading(true);
    try {
       console.log('Email submitted:', data.email);
        setTimeout(() => {
          setLoading(false);
          setStep(3);
        }, 1000); // Simulate API call
    } catch (error) {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Back Button */}
      {step > 1 && (
        <button
          onClick={() => setStep(prev => prev - 1)}
          className="fixed top-3 left-3 sm:top-4 sm:left-4 z-20 p-1.5 sm:p-2 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white shadow-md hover:shadow-lg transition-all lg:bg-gray-200 lg:hover:bg-gray-300 lg:backdrop-blur-none"
          aria-label="Revenir en arrière"
        >
          <ChevronLeft color='black' size={18} className="sm:w-5 sm:h-5" />
        </button>
      )}
      
      {/* Left Panel with Form */}
      <div className="w-full lg:w-1/2 bg-white overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-16">
          <div className="w-full max-w-md mx-auto">
            <div className="space-y-6">
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
              errors={errors}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <Step3
              handleSubmit={handleSubmit}
              register={register}
              onSubmit={handleOwnerSubmit}
              setValue={setValue}
              loading={loading}
              errors={errors}
              onBack={() => setStep(1)}
            />
          )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel with Background Image and Text */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-100 min-h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-sm"
          style={{ backgroundImage: step === 1 ? "url('/images/register.jpg')" : "url('/images/register2.jpg')" }}
        ></div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full bg-black/50 px-6">
          <h1 className="text-2xl xl:text-4xl font-bold text-white text-center mb-4">
            {step === 1 ? 'Simplifiez la gestion de votre salon avec Zyra' : 
             step === 2 ? 'Créez votre compte propriétaire' : 
             'Configurez votre salon'}
          </h1>
          <p className="text-base xl:text-lg text-gray-300 text-center max-w-md">
            {step === 1
              ? 'Une plateforme intuitive pour organiser vos rendez-vous, gérer vos équipes et fidéliser vos clients.'
              : step === 2 
              ? 'Entrez vos informations pour commencer à utiliser notre plateforme.'
              : 'Ajoutez les détails de votre salon pour finaliser votre inscription.'}
          </p>
        </div>
      </div>
    </div>
  );
}
