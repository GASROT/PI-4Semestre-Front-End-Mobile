import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { BottomNav } from "../../../components/bottom-nav";
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../../../constants/api";
import {
  listUsuarioMesasForAuth,
  removeUsuarioMesaLinkByMesa,
} from "../../../services/usuario-mesas";
import type { Mesa } from "../../../types/mesas";

export default function MesasListScreen() {
  const router = useRouter();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadMesas = async () => {
    setError(null);
    try {
      const vinculos = await listUsuarioMesasForAuth();
      const mesasVinculadas = vinculos
        .map((link) => link.mesa)
        .filter((mesa): mesa is Mesa => Boolean(mesa));
      setMesas(mesasVinculadas);
    } catch (err) {
      if (typeof err === "object" && err && "statusCode" in err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 401) {
          await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY]);
          router.replace("/");
          return;
        }
        if (!statusCode) {
          router.replace("/");
          return;
        }
      }
      const message =
        typeof err === "object" && err && "message" in err
          ? String((err as { message?: string }).message)
          : "Falha ao carregar mesas";
      setError(message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        setLoading(true);
        await loadMesas();
        if (active) {
          setLoading(false);
        }
      })();

      return () => {
        active = false;
      };
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMesas();
    setRefreshing(false);
  };

  const handleOpenMesa = (mesaId: string) => {
    router.push({ pathname: "/mesa-resumo", params: { mesaId } });
  };

  const handleFinalizar = async (mesaId: string) => {
    setError(null);
    setActionLoading(true);
    try {
      await removeUsuarioMesaLinkByMesa(mesaId);
      await loadMesas();
    } catch (err) {
      const message =
        typeof err === "object" && err && "message" in err
          ? String((err as { message?: string }).message)
          : "Falha ao finalizar mesa";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Mesa Atual</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <FlatList
          data={mesas}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Mesa {item.numero}</Text>
              <Text style={styles.meta}>Capacidade: {item.capacidade}</Text>
              <Text style={styles.meta}>Status: {item.status}</Text>
              <View style={styles.actions}>
                <Pressable
                  onPress={() => handleOpenMesa(item.id)}
                  style={({ pressed }) => [
                    styles.actionButton,
                    pressed && styles.actionButtonPressed,
                  ]}
                >
                  <Text style={styles.actionText}>Acessar Mesa</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleFinalizar(item.id)}
                  disabled={actionLoading}
                  style={({ pressed }) => [
                    styles.dangerButton,
                    pressed && styles.actionButtonPressed,
                    actionLoading && styles.actionButtonDisabled,
                  ]}
                >
                  <Text style={styles.dangerText}>
                    {actionLoading ? "Finalizando..." : "Finalizar"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              Nenhuma mesa vinculada ao usuario.
            </Text>
          }
        />
      </View>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  meta: {
    color: "#475467",
  },
  actions: {
    flexDirection: "row",
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#101828",
    paddingVertical: 10,
    alignItems: "center",
    marginRight: 10,
  },
  dangerButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#B42318",
    paddingVertical: 10,
    alignItems: "center",
  },
  actionButtonPressed: {
    opacity: 0.85,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionText: {
    color: "#101828",
    fontWeight: "600",
  },
  dangerText: {
    color: "#B42318",
    fontWeight: "600",
  },
  error: {
    color: "#B42318",
    marginBottom: 8,
  },
  empty: {
    color: "#667085",
  },
});
