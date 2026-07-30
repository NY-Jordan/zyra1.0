import { Calendar, Clock } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { SectionHeader } from './SectionHeader';
import { CARD_CLASS } from './shared';

export type Appointment = {
  date: string;
  time: string;
  client: string;
  service: string;
  duration: string;
};

function AppointmentRow({ appointment }: { appointment: Appointment }) {
  return (
    <View className="flex-row items-center justify-between rounded-xl bg-[#F8F4F0] p-3.5 dark:bg-slate-800/40">
      <View className="flex-1 flex-row items-center gap-3">
        <View className="gap-1">
          <View className="flex-row items-center gap-1.5">
            <Calendar size={11} color="#94a3b8" />
            <Text className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {appointment.date}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5 pl-[18px]">
            <Clock size={11} color="#94a3b8" />
            <Text className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
              {appointment.time}
            </Text>
          </View>
        </View>
        <View className="flex-1">
          <Text numberOfLines={1} className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
            {appointment.client}
          </Text>
          <Text numberOfLines={1} className="text-[12px] text-slate-400">
            {appointment.service}
          </Text>
        </View>
      </View>
      <Text className="text-[11px] font-semibold text-slate-400">{appointment.duration}</Text>
    </View>
  );
}

export function RecentAppointmentsCard({ appointments }: { appointments: Appointment[] }) {
  return (
    <View className={`${CARD_CLASS} p-5`}>
      <SectionHeader icon={<Calendar size={14} color="#059669" />} title="5 dernières réservations" />
      {appointments.length === 0 ? (
        <View className="items-center py-8">
          <Calendar size={28} color="#cbd5e1" />
          <Text className="mt-2 text-[13px] text-slate-400">Aucune réservation</Text>
        </View>
      ) : (
        <View className="gap-2.5">
          {appointments.map((appointment, index) => (
            <AppointmentRow key={index} appointment={appointment} />
          ))}
        </View>
      )}
    </View>
  );
}
