import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { AUTH_TOKEN_KEY } from "../constants/api";
import { listUsuarioMesasForAuth } from "../services/usuario-mesas";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [checked, setChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [linkedMesaId, setLinkedMesaId] = useState<string | null>(null);

  const protectedRoutes = useMemo(
    () =>
      new Set([
        "qr",
        "mesas",
        "mesa-conexao",
        "mesa-resumo",
        "cardapio",
        "pedidos",
        "pagamento",
        "profile",
        "minhas-mesas",
        "(cliente)",
      ]),
    []
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (active) {
        setIsAuthed(Boolean(token));
        setChecked(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [segments.join("/")]);

  useEffect(() => {
    if (!checked) return;
    const requiresAuth = segments.some((segment) => protectedRoutes.has(segment));
    if (requiresAuth && !isAuthed) {
      router.replace("./login");
    }
  }, [checked, isAuthed, protectedRoutes, router, segments]);

  useEffect(() => {
    if (!checked || !isAuthed) return;

    let active = true;
    (async () => {
      try {
        const vinculos = await listUsuarioMesasForAuth();
        const vinculoAtual = vinculos[0]?.mesa_id ?? null;
        if (active) {
          setLinkedMesaId(vinculoAtual);
        }
      } catch (err) {
        if (
          typeof err === "object" &&
          err &&
          "statusCode" in err &&
          (err as { statusCode?: number }).statusCode === 401
        ) {
          if (active) {
            setLinkedMesaId(null);
          }
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [checked, isAuthed, segments.join("/")]);

  useEffect(() => {
    if (!checked || !linkedMesaId) return;
  }, [checked, linkedMesaId]);

  if (!checked) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Pedido Rapido" }} />
      <Stack.Screen name="(auth)/login/index" options={{ title: "Login" }} />
      <Stack.Screen name="(auth)/register/index" options={{ title: "Registrar" }} />
      <Stack.Screen name="(cliente)/qr/index" options={{ title: "QR Code" }} />
      <Stack.Screen name="(cliente)/profile/index" options={{ title: "Perfil" }} />
      <Stack.Screen name="(cliente)/minhas-mesas/index" options={{ title: "Minhas Mesas" }} />
      <Stack.Screen name="(cliente)/mesa-conexao/index" options={{ title: "Conexao" }} />
      <Stack.Screen
        name="(cliente)/mesa-resumo/index"
        options={{ title: "Mesa", headerBackVisible: false, gestureEnabled: false }}
      />
      <Stack.Screen name="(cliente)/cardapio/index" options={{ title: "Cardapio" }} />
      <Stack.Screen name="(cliente)/mesas/index" options={{ title: "Mesa Atual" }} />
      <Stack.Screen name="pedidos/index" options={{ title: "Pedidos" }} />
      <Stack.Screen name="pedidos/novo" options={{ title: "Novo Pedido" }} />
      <Stack.Screen name="(admin)/hardware/index" options={{ title: "Hardware" }} />
      <Stack.Screen name="(cliente)/pagamento/index" options={{ title: "Pagamento" }} />
    </Stack>
  );
}
