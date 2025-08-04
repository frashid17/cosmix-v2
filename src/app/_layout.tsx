import "../global.css";
import "@/src/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { Slot } from "expo-router";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from '@clerk/clerk-expo/token-cache'



export default function Layout() {
  return (
    <GluestackUIProvider mode="light"><ClerkProvider tokenCache={tokenCache}>
        <Slot />
      </ClerkProvider></GluestackUIProvider>
  );
}
