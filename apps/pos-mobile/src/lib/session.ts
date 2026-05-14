import * as SecureStore from "expo-secure-store";
import NetInfo from "@react-native-community/netinfo";
import { authClient, AuthSession } from "../../auth-client";

const SESSION_KEY = "cached_session";

export async function getSession(): Promise<AuthSession | null> {
  try {
    const { isConnected } = await NetInfo.fetch();

    if (isConnected) {
      const fresh = await authClient.getSession();

      if (fresh?.data) {
        await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(fresh.data));
        return fresh.data as AuthSession;
      }

      // online but no session — user is logged out, clear cache
      await SecureStore.deleteItemAsync(SESSION_KEY);
      return null;
    }

    // offline — return cached session
    const cached = await SecureStore.getItemAsync(SESSION_KEY);
    return cached ? (JSON.parse(cached) as AuthSession) : null;
  } catch (err) {
    // network error or SecureStore failure — fall back to cache silently
    const cached = await SecureStore.getItemAsync(SESSION_KEY);
    return cached ? (JSON.parse(cached) as AuthSession) : null;
  }
}

export async function clearSession(): Promise<void> {
  try {
    await authClient.signOut();
  } finally {
    // always clear local cache even if signOut fails
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }
}

export async function refreshSession(): Promise<AuthSession | null> {
  try {
    const fresh = await authClient.getSession();
    if (fresh?.data) {
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(fresh.data));
      return fresh.data as AuthSession;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getCachedSession(): Promise<AuthSession | null> {
  const cached = await SecureStore.getItemAsync(SESSION_KEY);
  return cached ? (JSON.parse(cached) as AuthSession) : null;
}
