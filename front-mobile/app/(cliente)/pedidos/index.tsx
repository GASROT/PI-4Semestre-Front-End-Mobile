import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { listPedidos } from "../../services/pedidos";
import type { Pedido } from "../../types/pedidos";

export default function PedidosListScreen() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPedidos = async () => {
    setError(null);
    try {
      const data = await listPedidos();
      setPedidos(data);
    } catch (err) {
      const message =
        typeof err === "object" && err && "message" in err
          ? String((err as { message?: string }).message)
          : "Falha ao carregar pedidos";
      setError(message);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      await loadPedidos();
      if (active) {
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPedidos();
    setRefreshing(false);
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
      <Text style={styles.title}>Pedidos</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={pedidos}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pedido #{item.num_pedido}</Text>
            <Text style={styles.meta}>Mesa: {item.mesa?.numero ?? "-"}</Text>
            <Text style={styles.meta}>Preparo: {item.status_preparo}</Text>
            <Text style={styles.meta}>Pagamento: {item.status_pagamento}</Text>
            <Text style={styles.total}>
              Total: R$ {item.valor_total.toFixed(2)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum pedido encontrado</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F8FAFC",
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
  total: {
    marginTop: 6,
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
