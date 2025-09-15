import AsyncStorage from "@react-native-async-storage/async-storage";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";

type ThemeContextType = {
	theme: "light" | "dark";
	toggleTheme: () => void;
	colors: {
		background: string;
		text: string;
		textSecondary: string;
		primary: string;
		border: string;
		inputBackground: string;
		button: string;
		buttonText: string;
	};
};

const themeColors = {
	light: {
		background: "#fff",
		text: "#000",
		textSecondary: "#666",
		primary: "#00B37E",
		border: "#ddd",
		inputBackground: "#f9f9f9",
		button: "#007",
		buttonText: "#fff",
	},
	dark: {
		background: "#121212",
		text: "#fff",
		textSecondary: "#aaa",
		primary: "#00B37E",
		border: "#333",
		inputBackground: "#1E1E1E",
		button: "#59e067",
		buttonText: "#000",
	},
};

export const ThemeContext = createContext<ThemeContextType>({
	theme: "light",
	toggleTheme: () => {},
	colors: themeColors.light,
});

export function useTheme() {
	return useContext(ThemeContext);
}

//Provider que irá envolver toda a aplicação
export default function ThemeProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const colorScheme = Appearance.getColorScheme();
	const colorInASyncStorage = AsyncStorage.getItem("theme");
	const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(
		colorScheme || "light",
	);

	useEffect(() => {
		if (colorInASyncStorage) {
			colorInASyncStorage.then((value) => {
				if (value === "light" || value === "dark") {
					setCurrentTheme(value);
				}
			});
		}
	}, [colorInASyncStorage]);

	const toggleTheme = () => {
		const newTheme = currentTheme === "light" ? "dark" : "light";
		AsyncStorage.setItem("theme", newTheme);
		setCurrentTheme(newTheme);
	};

	return (
		<ThemeContext.Provider
			value={{
				theme: currentTheme,
				toggleTheme,
				colors: themeColors[currentTheme],
			}}
		>
			{children}
		</ThemeContext.Provider>
	);
}
