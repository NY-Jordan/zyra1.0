import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RoleId } from '@zyra/conf/domain/entities/permissions.entities';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { auth } from '@/lib/firebase';
import { authService, type AccountContext } from '@/services/authService';
import { permissionsService } from '@/services/permissionsService';

const SALON_ID_KEY = 'zyra:activeSalonId';

type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  accountContext: AccountContext | null;
  salonId: string | null;
  setSalonId: (salonId: string | null) => void;
  refreshAccountContext: () => Promise<void>;
  logout: () => Promise<void>;
  /** Owner always has every permission; a member depends on the salon's role matrix. */
  hasPermission: (key: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [accountContext, setAccountContext] = useState<AccountContext | null>(null);
  const [salonId, setSalonIdState] = useState<string | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Record<RoleId, string[]> | null>(null);

  const resolveAccountContext = async (firebaseUser: User) => {
    const context = await authService.getAccountContext(firebaseUser.uid);
    setAccountContext(context);
    if (context.type === 'member') {
      await setSalonId(context.member.salonId);
    }
    return context;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setAccountContext(null);
        setStatus('signedOut');
        return;
      }

      setUser(firebaseUser);
      const storedSalonId = await AsyncStorage.getItem(SALON_ID_KEY);
      setSalonIdState(storedSalonId);

      try {
        const context = await resolveAccountContext(firebaseUser);
        if (context.type === 'unknown') {
          await authService.logout();
          return;
        }
        setStatus('signedIn');
      } catch {
        await authService.logout();
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (accountContext?.type !== 'member' || !salonId) {
      setRolePermissions(null);
      return;
    }
    permissionsService.getRolePermissions(salonId).then(setRolePermissions);
  }, [accountContext, salonId]);

  const setSalonId = async (nextSalonId: string | null) => {
    setSalonIdState(nextSalonId);
    if (nextSalonId) {
      await AsyncStorage.setItem(SALON_ID_KEY, nextSalonId);
    } else {
      await AsyncStorage.removeItem(SALON_ID_KEY);
    }
  };

  const logout = async () => {
    await setSalonId(null);
    await authService.logout();
  };

  const refreshAccountContext = async () => {
    if (user) {
      await resolveAccountContext(user);
    }
  };

  const hasPermission = (key: string): boolean => {
    if (accountContext?.type === 'owner') return true;
    if (accountContext?.type === 'member') {
      return (rolePermissions?.[accountContext.member.roleId] ?? []).includes(key);
    }
    return false;
  };

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, accountContext, salonId, setSalonId, refreshAccountContext, logout, hasPermission }),
    [status, user, accountContext, salonId, rolePermissions]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
