import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import type { SFSymbol } from "sf-symbols-typescript";
import { Platform } from "react-native";

const isIOS = Platform.OS === "ios";

export const ios26ModalOptions: NativeStackNavigationOptions = {
  presentation: "modal",
};

export const ios26ScrollEdgeEffects: NativeStackNavigationOptions["scrollEdgeEffects"] = isIOS
  ? {
      top: "automatic",
      bottom: "automatic",
    }
  : undefined;

export const ios26LargeTitleScreenOptions: Pick<
  NativeStackNavigationOptions,
  "headerLargeTitle" | "scrollEdgeEffects"
> = {
  headerLargeTitle: isIOS,
  scrollEdgeEffects: ios26ScrollEdgeEffects,
};

export function createNativeCloseButtonOptions(
  onPress: () => void,
  label = "Close",
): Pick<NativeStackNavigationOptions, "unstable_headerLeftItems"> {
  if (!isIOS) {
    return {};
  }

  return {
    unstable_headerLeftItems: () => [
      {
        type: "button",
        label,
        onPress,
        variant: "plain",
        accessibilityLabel: label,
      },
    ],
  };
}

export function createNativeSymbolButtonOptions(
  onPress: () => void,
  symbol: SFSymbol,
  label: string,
): Pick<NativeStackNavigationOptions, "unstable_headerRightItems"> {
  if (!isIOS) {
    return {};
  }

  return {
    unstable_headerRightItems: () => [
      {
        type: "button",
        label: "",
        icon: { type: "sfSymbol", name: symbol },
        onPress,
        accessibilityLabel: label,
      },
    ],
  };
}
