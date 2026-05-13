import { Colors } from "@/constants/theme";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useColorScheme } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60,
    },
  },
});

export default function RootLayout() {
  const scheme = useColorScheme();
  const bg = scheme === "dark" ? Colors.dark.background : Colors.light.background;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: bg }}
          edges={["top", "right", "left", "bottom"]}
        >
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { flex: 1, backgroundColor: bg },
            }}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
