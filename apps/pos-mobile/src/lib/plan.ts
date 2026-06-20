import * as SecureStore from "expo-secure-store";
import NetInfo from "@react-native-community/netinfo";
import { getUserPlans } from "../api/plans";
import { Plan } from "@/types/plans";

const USER_PLAN_KEY = "cached_user_plan";

export async function getStoredUserPlan(): Promise<Plan | null> {
  try {
    const { isConnected } = await NetInfo.fetch();

    if (isConnected) {
      const fresh = await getUserPlans();

      if (fresh) {
        await SecureStore.setItemAsync(USER_PLAN_KEY, JSON.stringify(fresh));
        return fresh;
      }

      await SecureStore.deleteItemAsync(USER_PLAN_KEY);
      return null;
    }

    const cached = await SecureStore.getItemAsync(USER_PLAN_KEY);
    return cached ? (JSON.parse(cached) as Plan) : null;
  } catch {
    const cached = await SecureStore.getItemAsync(USER_PLAN_KEY);
    return cached ? (JSON.parse(cached) as Plan) : null;
  }
}

export async function clearStoredUserPlan(): Promise<void> {
  await SecureStore.deleteItemAsync(USER_PLAN_KEY);
}
