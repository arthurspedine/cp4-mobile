import { Stack } from "expo-router";
import ThemeProvider from "../src/context/ThemeContext";
import { AuthProvider } from "../src/context/AuthContext";
import i18n from "../src/services/i18n";
import { I18nextProvider } from "react-i18next";

export default function Layout() {
	return (
		<I18nextProvider i18n={i18n}>
			<AuthProvider>
				<ThemeProvider>
					<Stack screenOptions={{ headerShown: false }} />
				</ThemeProvider>
			</AuthProvider>
		</I18nextProvider>
	);
}
