import { Stack } from "expo-router";
import ThemeProvider from "../src/context/ThemeContext";
import { AuthProvider } from "../src/context/AuthContext";
import { TaskProvider } from "../src/context/TaskContext";
import i18n from "../src/services/i18n";
import { I18nextProvider } from "react-i18next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 2,
			staleTime: 5 * 60 * 1000, // 5 minutos
			gcTime: 10 * 60 * 1000, // 10 minutos (antigamente cacheTime)
		},
	},
});

export default function Layout() {
	return (
		<QueryClientProvider client={queryClient}>
			<I18nextProvider i18n={i18n}>
				<AuthProvider>
					<TaskProvider>
						<ThemeProvider>
							<Stack screenOptions={{ headerShown: false }} />
						</ThemeProvider>
					</TaskProvider>
				</AuthProvider>
			</I18nextProvider>
		</QueryClientProvider>
	);
}
