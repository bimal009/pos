import * as SecureStore from "expo-secure-store";
import NetInfo from "@react-native-community/netinfo";
import { authClient, AuthSession } from "../../auth-client";

const SESSION_KEY = "cached_session";

export async function getSession(): Promise<AuthSession | null> {
  const { isConnected } = await NetInfo.fetch();

  if (isConnected) {
    const fresh = await authClient.getSession();
    if (fresh?.data) {
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(fresh.data));
      return fresh.data;
    }
  }

  const cached = await SecureStore.getItemAsync(SESSION_KEY);
  return cached ? JSON.parse(cached) : null;
}

export async function clearSession() {
  await authClient.signOut();
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
