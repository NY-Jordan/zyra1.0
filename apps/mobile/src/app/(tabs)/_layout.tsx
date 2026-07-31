import { Tabs } from 'expo-router';
import { Calendar, LayoutDashboard, Menu, ShoppingBag, User2 } from 'lucide-react-native';
import { useColorScheme } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';

export default function TabsLayout() {
  const isDark = useColorScheme() === 'dark';
  const { hasPermission, accountContext } = useAuth();
  const active = '#059669';
  const inactive = isDark ? '#64748b' : '#94a3b8';

  const isOwner = accountContext?.type === 'owner';
  const tabHref = (permissionKey: string) => (isOwner || hasPermission(permissionKey) ? undefined : null);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: inactive,
        tabBarStyle: {
          backgroundColor: isDark ? '#11151C' : '#ffffff',
          borderTopColor: isDark ? 'rgba(148,163,184,0.15)' : '#F0EAE4',
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Rendez-vous',
          href: tabHref('bookings.view'),
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Commandes',
          href: tabHref('orders.view'),
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          href: tabHref('clients.view'),
          tabBarIcon: ({ color, size }) => <User2 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Plus',
          tabBarIcon: ({ color, size }) => <Menu size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
