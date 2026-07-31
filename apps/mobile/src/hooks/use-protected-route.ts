import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';

export function useProtectedRoute() {
  const { status, accountContext, salonId } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    const current = segments[0];
    const onLoginScreen = current === 'login';
    const onSetupScreen = current === 'setup';
    const onChangePasswordScreen = current === 'change-password';
    const needsSalonSetup = accountContext?.type === 'owner' && !salonId;
    const needsPasswordChange = accountContext?.type === 'member' && accountContext.member.mustChangePassword;

    if (status === 'signedOut') {
      if (!onLoginScreen) router.replace('/login');
      return;
    }

    // status === 'signedIn'
    if (needsPasswordChange) {
      if (!onChangePasswordScreen) router.replace('/change-password');
    } else if (needsSalonSetup) {
      if (!onSetupScreen) router.replace('/setup');
    } else if (onLoginScreen || onSetupScreen || onChangePasswordScreen) {
      router.replace('/');
    }
  }, [status, accountContext, salonId, segments, router]);
}
