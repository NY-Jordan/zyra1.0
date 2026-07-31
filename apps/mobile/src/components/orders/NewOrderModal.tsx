import type { IClient } from '@zyra/conf/domain/entities/clients.entities';
import type { ISalon, ISalonService, ISalonServiceSupplement } from '@zyra/conf/domain/entities/salons.entities';
import { orderPaymentMethodEnum } from '@zyra/conf/domain/enums/OrderEnum';
import {
  Banknote,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  Scissors,
  Smartphone,
  User2,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { SheetModal } from '@/components/ui/SheetModal';
import { clientService } from '@/services/clientService';
import { hairdresserService, type HairDresserWithSalonAssociation } from '@/services/hairdresserService';
import { orderService } from '@/services/orderService';
import { salonService } from '@/services/salonService';

import { ClientSearchModal } from './ClientSearchModal';

const STEPS = ['Client', 'Service', 'Paiement'];

function Stepper({ current }: { current: number }) {
  return (
    <View className="flex-row items-center">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <View key={label} className="flex-1 flex-row items-center">
            <View className="items-center gap-1.5">
              <View
                className={`h-8 w-8 items-center justify-center rounded-full ${
                  done || active ? 'bg-emerald-500' : 'bg-[#F5F2EF] dark:bg-slate-700'
                }`}>
                {done ? (
                  <Check size={16} color="#ffffff" />
                ) : (
                  <Text className={`text-[12px] font-bold ${active ? 'text-white' : 'text-slate-400'}`}>{i + 1}</Text>
                )}
              </View>
              <Text
                className={`text-[10px] font-semibold ${
                  active || done ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'
                }`}>
                {label}
              </Text>
            </View>
            {i < STEPS.length - 1 ? (
              <View className={`mb-4 h-0.5 flex-1 rounded-full ${i < current ? 'bg-emerald-400' : 'bg-[#F0EAE4] dark:bg-slate-700'}`} />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
      {children}
    </Text>
  );
}

function SelectableRow({
  selected,
  onPress,
  icon,
  label,
  meta,
}: {
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
  label: string;
  meta?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 ${
        selected ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 'border-[#F0EAE4] dark:border-slate-700'
      }`}>
      <View className="flex-1 flex-row items-center gap-2.5">
        {icon}
        <Text numberOfLines={1} className="flex-1 text-[13px] font-medium text-slate-700 dark:text-slate-300">
          {label}
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        {meta}
        <View className={`h-[18px] w-[18px] items-center justify-center rounded-full ${selected ? 'bg-emerald-500' : 'bg-[#F0EAE4] dark:bg-slate-700'}`}>
          {selected ? <Check size={11} color="#ffffff" /> : null}
        </View>
      </View>
    </Pressable>
  );
}

type FormData = {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  linkedClientId: string | null;
  serviceId: string;
  hairDresserId: string;
  supplements: string[];
  paymentMethod: orderPaymentMethodEnum;
  isPaid: boolean;
  notes: string;
  saveAsRegularClient: boolean;
};

const INITIAL_FORM: FormData = {
  clientName: '',
  clientPhone: '',
  clientEmail: '',
  linkedClientId: null,
  serviceId: '',
  hairDresserId: '',
  supplements: [],
  paymentMethod: orderPaymentMethodEnum.cash,
  isPaid: true,
  notes: '',
  saveAsRegularClient: false,
};

export function NewOrderModal({
  visible,
  onClose,
  salonId,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  salonId: string;
  onCreated: () => void;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [salon, setSalon] = useState<ISalon | null>(null);
  const [hairDressers, setHairDressers] = useState<HairDresserWithSalonAssociation[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [duplicateClient, setDuplicateClient] = useState<IClient | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    setIsLoadingData(true);
    Promise.all([salonService.getById(salonId), hairdresserService.getBySalon(salonId)])
      .then(([salonData, hairDressersData]) => {
        setSalon(salonData);
        setHairDressers(hairDressersData);
      })
      .finally(() => setIsLoadingData(false));
  }, [visible, salonId]);

  useEffect(() => {
    if (form.linkedClientId || !form.clientPhone) {
      setDuplicateClient(null);
      return;
    }
    const timeout = setTimeout(() => {
      orderService.findClientByPhone(salonId, form.clientPhone).then(setDuplicateClient).catch(() => setDuplicateClient(null));
    }, 500);
    return () => clearTimeout(timeout);
  }, [form.clientPhone, form.linkedClientId, salonId]);

  const resetAndClose = () => {
    setForm(INITIAL_FORM);
    setDuplicateClient(null);
    setStep(0);
    setError('');
    onClose();
  };

  const selectedService = salon?.services.find((s) => s.id === form.serviceId);
  const selectedHairDresser = hairDressers.find((h) => h.id === form.hairDresserId);

  const qualifiedHairDressers = useMemo(() => {
    if (!selectedService) return [];
    return hairDressers.filter((hd) => hd.associationHairdresser?.salonServiceIds?.includes(selectedService.categoryId));
  }, [hairDressers, selectedService]);

  const servicePrice = selectedService?.price ?? 0;
  const supplementsPrice = form.supplements.reduce((acc, name) => {
    const supp = selectedService?.supplements?.find((s) => s.name === name);
    return acc + (supp?.price ?? 0);
  }, 0);
  const totalPrice = servicePrice + supplementsPrice;

  const handleImportClient = (client: IClient) => {
    setForm((prev) => ({
      ...prev,
      clientName: client.name,
      clientPhone: client.phone,
      clientEmail: client.email ?? '',
      linkedClientId: client.id,
      saveAsRegularClient: true,
    }));
  };

  const handleRemoveImportedClient = () => {
    setForm((prev) => ({ ...prev, clientName: '', clientPhone: '', clientEmail: '', linkedClientId: null, saveAsRegularClient: false }));
  };

  const handleServiceSelect = (serviceId: string) => {
    setForm((prev) => ({ ...prev, serviceId, supplements: [], hairDresserId: '' }));
  };

  const toggleSupplement = (name: string) => {
    setForm((prev) => ({
      ...prev,
      supplements: prev.supplements.includes(name) ? prev.supplements.filter((s) => s !== name) : [...prev.supplements, name],
    }));
  };

  const canProceedStep0 = !!form.clientName && !!form.clientPhone;
  const canProceedStep1 = !!form.serviceId && !!form.hairDresserId;

  const goNext = () => {
    setError('');
    if (step === 0 && !canProceedStep0) {
      setError('Renseignez au moins le nom et le téléphone du client.');
      return;
    }
    if (step === 0 && form.saveAsRegularClient && duplicateClient) {
      setError(`"${duplicateClient.name}" existe déjà avec ce numéro : importez-le ou décochez "client régulier".`);
      return;
    }
    if (step === 1 && !canProceedStep1) {
      setError('Sélectionnez un service et un coiffeur.');
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!selectedService || !selectedHairDresser) return;
    setIsSubmitting(true);
    setError('');
    try {
      await orderService.createOrder({
        salonId,
        clientName: form.clientName,
        clientPhone: form.clientPhone,
        clientEmail: form.clientEmail || undefined,
        linkedClientId: form.linkedClientId,
        saveAsRegularClient: form.saveAsRegularClient,
        service: selectedService,
        hairDresser: selectedHairDresser,
        selectedSupplementNames: form.supplements,
        paymentMethod: form.paymentMethod,
        isPaid: form.isPaid,
        notes: form.notes || undefined,
      });
      onCreated();
      resetAndClose();
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la création de la commande.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SheetModal
      visible={visible}
      onClose={resetAndClose}
      title="Nouvelle commande"
      footer={
        <View className="flex-row items-center justify-between">
          {step > 0 ? (
            <Pressable onPress={goBack} disabled={isSubmitting} className="h-10 flex-row items-center gap-1.5 px-3">
              <ChevronLeft size={15} color="#64748b" />
              <Text className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">Précédent</Text>
            </Pressable>
          ) : (
            <Pressable onPress={resetAndClose} disabled={isSubmitting} className="h-10 px-3">
              <Text className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">Annuler</Text>
            </Pressable>
          )}

          {step < STEPS.length - 1 ? (
            <Pressable
              onPress={goNext}
              className="h-10 flex-row items-center gap-1.5 rounded-xl bg-[#22C55E] px-4 active:bg-[#16A34A]">
              <Text className="text-[13px] font-bold text-white">Suivant</Text>
              <ChevronRight size={15} color="#ffffff" />
            </Pressable>
          ) : (
            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={{ opacity: isSubmitting ? 0.6 : 1 }}
              className="h-10 flex-row items-center gap-1.5 rounded-xl bg-[#22C55E] px-4 active:bg-[#16A34A]">
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Check size={15} color="#ffffff" />
                  <Text className="text-[13px] font-bold text-white">Créer la commande</Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      }>
      <Stepper current={step} />

      {isLoadingData ? (
        <View className="items-center py-10">
          <ActivityIndicator color="#059669" />
        </View>
      ) : (
        <>
          {error ? (
            <View className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 dark:border-rose-800/40 dark:bg-rose-950/20">
              <Text className="text-[12px] text-rose-700 dark:text-rose-400">{error}</Text>
            </View>
          ) : null}

          {step === 0 ? (
            <View className="gap-4">
              {form.linkedClientId ? (
                <View className="flex-row items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 dark:border-emerald-800/50 dark:bg-emerald-950/20">
                  <View className="flex-row items-center gap-2">
                    <UserCheck size={15} color="#059669" />
                    <Text className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-400">
                      Client existant importé
                    </Text>
                  </View>
                  <Pressable onPress={handleRemoveImportedClient}>
                    <Text className="text-[11px] font-bold text-rose-500">Retirer</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => setClientSearchOpen(true)}
                  className="h-10 flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800">
                  <UserPlus size={15} color="#059669" />
                  <Text className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Importer un client existant
                  </Text>
                </Pressable>
              )}

              <View>
                <FieldLabel>Nom complet *</FieldLabel>
                <TextInput
                  value={form.clientName}
                  onChangeText={(clientName) => setForm((prev) => ({ ...prev, clientName }))}
                  placeholder="Ex: Jean Dupont"
                  placeholderTextColor="#94a3b8"
                  editable={!form.linkedClientId}
                  className="h-11 rounded-xl border border-[#E8E0D8] bg-white px-3.5 text-[14px] text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </View>

              <View>
                <FieldLabel>Téléphone *</FieldLabel>
                <TextInput
                  value={form.clientPhone}
                  onChangeText={(clientPhone) => setForm((prev) => ({ ...prev, clientPhone }))}
                  placeholder="Ex: +237 6XX XX XX XX"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  editable={!form.linkedClientId}
                  className="h-11 rounded-xl border border-[#E8E0D8] bg-white px-3.5 text-[14px] text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </View>

              <View>
                <FieldLabel>Email (optionnel)</FieldLabel>
                <TextInput
                  value={form.clientEmail}
                  onChangeText={(clientEmail) => setForm((prev) => ({ ...prev, clientEmail }))}
                  placeholder="Ex: jean@example.com"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!form.linkedClientId}
                  className="h-11 rounded-xl border border-[#E8E0D8] bg-white px-3.5 text-[14px] text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </View>

              {!form.linkedClientId ? (
                <View className="flex-row items-center justify-between rounded-xl bg-[#F8F4F0] px-3.5 py-3 dark:bg-slate-800/40">
                  <Text className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                    Enregistrer comme client régulier
                  </Text>
                  <Switch
                    value={form.saveAsRegularClient}
                    onValueChange={(saveAsRegularClient) => setForm((prev) => ({ ...prev, saveAsRegularClient }))}
                    trackColor={{ true: '#22C55E' }}
                  />
                </View>
              ) : null}

              {duplicateClient ? (
                form.saveAsRegularClient ? (
                  <View className="gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 dark:border-amber-800/50 dark:bg-amber-950/20">
                    <View className="flex-row items-center justify-between gap-3">
                      <Text className="flex-1 text-[11px] text-amber-700 dark:text-amber-400">
                        "{duplicateClient.name}" utilise déjà ce numéro de téléphone.
                      </Text>
                      <Pressable onPress={() => handleImportClient(duplicateClient)}>
                        <Text className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Importer</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2.5 dark:border-sky-800/50 dark:bg-sky-950/20">
                    <Info size={13} color="#0284c7" />
                    <Text className="flex-1 text-[11px] text-sky-700 dark:text-sky-400">
                      "{duplicateClient.name}" existe déjà avec ce numéro.
                    </Text>
                  </View>
                )
              ) : null}
            </View>
          ) : null}

          {step === 1 ? (
            <View className="gap-4">
              <View>
                <FieldLabel>Service *</FieldLabel>
                {!salon?.services.length ? (
                  <Text className="text-[12px] text-slate-400">Aucun service configuré pour ce salon.</Text>
                ) : (
                  <View className="gap-2">
                    {salon.services.map((service: ISalonService) => (
                      <SelectableRow
                        key={service.id}
                        selected={form.serviceId === service.id}
                        onPress={() => handleServiceSelect(service.id)}
                        icon={
                          service.imageUrl ? (
                            <Image source={{ uri: service.imageUrl }} className="h-10 w-10 rounded-lg" />
                          ) : (
                            <View className="h-10 w-10 items-center justify-center rounded-lg bg-[#F5F2EF] dark:bg-slate-700">
                              <Scissors size={16} color="#94a3b8" />
                            </View>
                          )
                        }
                        label={service.name}
                        meta={
                          <Text className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                            {service.price.toLocaleString('fr-FR')} XAF
                          </Text>
                        }
                      />
                    ))}
                  </View>
                )}
              </View>

              {selectedService ? (
                <View>
                  <FieldLabel>Coiffeur *</FieldLabel>
                  {qualifiedHairDressers.length === 0 ? (
                    <View className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 dark:border-amber-800/50 dark:bg-amber-950/20">
                      <Text className="text-[12px] text-amber-700 dark:text-amber-400">
                        Aucun coiffeur n'est encore associé à ce service.
                      </Text>
                    </View>
                  ) : (
                    <View className="gap-2">
                      {qualifiedHairDressers.map((hd) => (
                        <SelectableRow
                          key={hd.id}
                          selected={form.hairDresserId === hd.id}
                          onPress={() => setForm((prev) => ({ ...prev, hairDresserId: hd.id }))}
                          icon={<Avatar name={hd.name} uri={hd.photo} size={36} />}
                          label={hd.name}
                          meta={<Text className="text-[11px] text-slate-400">{hd.speciality}</Text>}
                        />
                      ))}
                    </View>
                  )}
                </View>
              ) : null}

              {selectedService?.supplements && selectedService.supplements.length > 0 ? (
                <View>
                  <FieldLabel>Suppléments (optionnels)</FieldLabel>
                  <View className="gap-2">
                    {selectedService.supplements.map((supplement: ISalonServiceSupplement) => (
                      <SelectableRow
                        key={supplement.name}
                        selected={form.supplements.includes(supplement.name)}
                        onPress={() => toggleSupplement(supplement.name)}
                        label={supplement.name}
                        meta={
                          <Text className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                            {supplement.price.toLocaleString('fr-FR')} XAF
                          </Text>
                        }
                      />
                    ))}
                  </View>
                </View>
              ) : null}

              {selectedService ? (
                <View className="gap-1.5 rounded-xl bg-[#F8F4F0] px-4 py-3 dark:bg-slate-800/40">
                  <View className="flex-row justify-between">
                    <Text className="text-[12px] text-slate-500 dark:text-slate-400">Prix du service</Text>
                    <Text className="text-[12px] text-slate-500 dark:text-slate-400">
                      {servicePrice.toLocaleString('fr-FR')} XAF
                    </Text>
                  </View>
                  {supplementsPrice > 0 ? (
                    <View className="flex-row justify-between">
                      <Text className="text-[12px] text-slate-500 dark:text-slate-400">Suppléments</Text>
                      <Text className="text-[12px] text-slate-500 dark:text-slate-400">
                        {supplementsPrice.toLocaleString('fr-FR')} XAF
                      </Text>
                    </View>
                  ) : null}
                  <View className="flex-row justify-between border-t border-[#EDE8E3] pt-1.5 dark:border-slate-700">
                    <Text className="text-[14px] font-bold text-slate-800 dark:text-white">Total</Text>
                    <Text className="text-[14px] font-bold text-emerald-600 dark:text-emerald-400">
                      {totalPrice.toLocaleString('fr-FR')} XAF
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          ) : null}

          {step === 2 ? (
            <View className="gap-4">
              <View>
                <FieldLabel>Méthode de paiement *</FieldLabel>
                <View className="gap-2">
                  <SelectableRow
                    selected={form.paymentMethod === orderPaymentMethodEnum.cash}
                    onPress={() => setForm((prev) => ({ ...prev, paymentMethod: orderPaymentMethodEnum.cash }))}
                    icon={<Banknote size={16} color="#94a3b8" />}
                    label="Espèces"
                  />
                  <SelectableRow
                    selected={form.paymentMethod === orderPaymentMethodEnum.mobile}
                    onPress={() => setForm((prev) => ({ ...prev, paymentMethod: orderPaymentMethodEnum.mobile }))}
                    icon={<Smartphone size={16} color="#94a3b8" />}
                    label="Mobile Money"
                  />
                </View>
              </View>

              <View className="flex-row items-center justify-between rounded-xl bg-[#F8F4F0] px-3.5 py-3 dark:bg-slate-800/40">
                <Text className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">Paiement effectué</Text>
                <Switch
                  value={form.isPaid}
                  onValueChange={(isPaid) => setForm((prev) => ({ ...prev, isPaid }))}
                  trackColor={{ true: '#22C55E' }}
                />
              </View>

              <View>
                <FieldLabel>Notes (optionnel)</FieldLabel>
                <TextInput
                  value={form.notes}
                  onChangeText={(notes) => setForm((prev) => ({ ...prev, notes }))}
                  placeholder="Ajoutez des notes supplémentaires..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={3}
                  className="rounded-xl border border-[#E8E0D8] bg-white p-3.5 text-[14px] text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  style={{ textAlignVertical: 'top', minHeight: 72 }}
                />
              </View>

              <View className="gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 dark:border-emerald-800/50 dark:bg-emerald-950/20">
                <Text className="text-[11px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                  Récapitulatif
                </Text>
                <View className="gap-1">
                  <View className="flex-row items-center gap-1.5">
                    <User2 size={12} color="#94a3b8" />
                    <Text className="text-[12px] text-slate-600 dark:text-slate-300">{form.clientName || '—'}</Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <Scissors size={12} color="#94a3b8" />
                    <Text className="text-[12px] text-slate-600 dark:text-slate-300">{selectedService?.name || '—'}</Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <Users size={12} color="#94a3b8" />
                    <Text className="text-[12px] text-slate-600 dark:text-slate-300">{selectedHairDresser?.name || '—'}</Text>
                  </View>
                </View>
                <View className="flex-row justify-between border-t border-emerald-200 pt-1.5 dark:border-emerald-800/50">
                  <Text className="text-[14px] font-bold text-slate-800 dark:text-white">Total à payer</Text>
                  <Text className="text-[14px] font-bold text-emerald-600 dark:text-emerald-400">
                    {totalPrice.toLocaleString('fr-FR')} XAF
                  </Text>
                </View>
              </View>
            </View>
          ) : null}
        </>
      )}

      <ClientSearchModal
        visible={clientSearchOpen}
        onClose={() => setClientSearchOpen(false)}
        salonId={salonId}
        onSelectClient={handleImportClient}
      />
    </SheetModal>
  );
}
