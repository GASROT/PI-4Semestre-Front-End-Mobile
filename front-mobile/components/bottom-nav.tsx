import { Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { useRouter, useSegments } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { NavButton } from "./nav-button";
import { AUTH_TOKEN_KEY } from "../constants/api";
import { listUsuarioMesasForAuth } from "../services/usuario-mesas";

export function BottomNav() {
  const router = useRouter();
  const segments = useSegments();
  const current = segments[segments.length - 1] ?? "";
  const [hasMesaLink, setHasMesaLink] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        if (active) {
          setHasMesaLink(false);
        }
        return;
      }

      try {
        const vinculos = await listUsuarioMesasForAuth();
        if (active) {
          setHasMesaLink(vinculos.length > 0);
        }
      } catch {
        if (active) {
          setHasMesaLink(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [segments.join("/")]);

  return (
    <View style={styles.wrapper}>
      {!hasMesaLink ? (
        <Pressable
          onPress={() => router.push("/qr")}
          style={({ pressed }) => [
            styles.qrButton,
            pressed && styles.qrButtonPressed,
          ]}
        >
          <Text style={styles.qrText}>QR</Text>
        </Pressable>
      ) : null}
      <View style={styles.container}>
        <NavButton
          label="Perfil"
          active={current === "profile"}
          onPress={() => router.push("/profile")}
        />
        <NavButton
          label="Mesa Atual"
          active={current === "mesas"}
          onPress={() => router.push("/mesas")}
        />
        <NavButton
          label="Minhas Mesas"
          active={current === "minhas-mesas"}
          onPress={() => router.push("/minhas-mesas")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 8,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
  },
  qrButton: {
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#101828",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 6,
  },
  qrButtonPressed: {
    opacity: 0.8,
  },
  qrText: {
    color: "#101828",
    fontWeight: "700",
  },
});
