import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { BottomNav } from "../../../components/bottom-nav";
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../../../constants/api";
import { fecharMesa, listMesas } from "../../../services/mesas";
import {
  finalizarComanda,
  createComanda,
  getComandaById,
} from "../../../services/comandas";
import { obterComandaAtiva } from "../../../services/mesa-conexao";
import { listPedidos } from "../../../services/pedidos";
import {
  listUsuarioMesasForAuth,
  removeUsuarioMesaLinkById,
  removeUsuarioMesaLinkByMesa,
} from "../../../services/usuario-mesas";
import type { Comanda } from "../../../types/comandas";
import type { Mesa } from "../../../types/mesas";
import type { Pedido } from "../../../types/pedidos";

export default function MesaResumoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mesaId = typeof params.mesaId === "string" ? params.mesaId : "";

  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [comanda, setComanda] = useState<Comanda | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPedidoId, setExpandedPedidoId] = useState<string | null>(null);

  const loadData = async () => {
    if (!mesaId) {
      try {
        const vinculos = await listUsuarioMesasForAuth();
        const vinculoAtual = vinculos[0]?.mesa_id;
        if (vinculoAtual) {
          router.replace({
            pathname: "/mesa-resumo",
            params: { mesaId: vinculoAtual },
          });
          return;
        }
      } catch {
        // fallback below
      }
      router.replace("/mesas");
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const mesas = await listMesas();
      const foundMesa = mesas.find((item) => item.id === mesaId) ?? null;
      setMesa(foundMesa);

      const comandaAtiva = await obterComandaAtiva(mesaId);
      if (comandaAtiva) {
        const fullComanda = await getComandaById(comandaAtiva.id);
        setComanda(fullComanda);
        const pedidosMesa = await listPedidos();
        setPedidos(
          pedidosMesa
            .filter((item) => item.comanda_id === comandaAtiva.id)
            .sort((a, b) => {
              const dateA = Date.parse(a.data_hora);
              const dateB = Date.parse(b.data_hora);
              if (dateA !== dateB) {
                return dateB - dateA;
              }
              return b.num_pedido - a.num_pedido;
            })
        );
      } else {
        setComanda(null);
        setPedidos([]);
      }
    } catch (err) {
      if (
        typeof err === "object" &&
        err &&
        "statusCode" in err &&
        (err as { statusCode?: number }).statusCode === 401
      ) {
        await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY]);
        router.replace("./login");
        return;
      }
      const message =
        typeof err === "object" && err && "message" in err
          ? String((err as { message?: string }).message)
          : "Falha ao carregar mesa";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [mesaId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreateComanda = async () => {
    if (!mesaId || actionLoading) return;
    setActionLoading(true);
    setError(null);
    try {
      await createComanda({ mesa_id: mesaId });
      await loadData();
    } catch (err) {
      const message =
        typeof err === "object" && err && "message" in err
          ? String((err as { message?: string }).message)
          : "Falha ao criar comanda";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCardapio = () => {
    if (!mesaId) return;
    router.push({
      pathname: "/cardapio",
      params: { mesaId, comandaId: comanda?.id ?? "" },
    });
  };

  const handleFinalizarMesa = async () => {
    if (!mesaId || closing) return;
    setClosing(true);
    setError(null);
    try {
      if (comanda?.id) {
        await finalizarComanda(comanda.id, { metodo_pagamento: "PIX" });
      }
      try {
        await removeUsuarioMesaLinkByMesa(mesaId);
      } catch (linkError) {
        const message =
          typeof linkError === "object" && linkError && "message" in linkError
            ? String((linkError as { message?: string }).message)
            : "";
        if (message.includes("Route not found")) {
          const vinculos = await listUsuarioMesasForAuth();
          const vinculo = vinculos.find((item) => item.mesa_id === mesaId);
          if (vinculo) {
            await removeUsuarioMesaLinkById(vinculo.id);
          }
        } else {
          throw linkError;
        }
      }
      await fecharMesa(mesaId);
      router.replace("/mesas");
    } catch (err) {
      const message =
        typeof err === "object" && err && "message" in err
          ? String((err as { message?: string }).message)
          : "Falha ao finalizar mesa";
      setError(message);
    } finally {
      setClosing(false);
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
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollBody}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Mesa</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mesa {mesa?.numero ?? "-"}</Text>
          <Text style={styles.meta}>ID: {mesa?.id ?? "-"}</Text>
          <Text style={styles.meta}>Status: {mesa?.status ?? "-"}</Text>
          <Text style={styles.meta}>Total: R$ {mesa?.total?.toFixed(2)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comanda</Text>
          {comanda ? (
            <View style={styles.card}>
              <Text style={styles.meta}>ID: {comanda.id}</Text>
              <Text style={styles.meta}>Status: {comanda.status}</Text>
              <Text style={styles.meta}>
                Total: R$ {comanda.total.toFixed(2)}
              </Text>
              <Text style={styles.meta}>
                Criada: {comanda.criado_em ?? "-"}
              </Text>
            </View>
          ) : (
            <Text style={styles.empty}>Nenhuma comanda ativa.</Text>
          )}
          {!comanda ? (
            <Pressable
              onPress={handleCreateComanda}
              disabled={actionLoading}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
                actionLoading && styles.primaryButtonDisabled,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {actionLoading ? "Criando..." : "Criar comanda"}
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pedidos</Text>
          {pedidos.length ? (
            pedidos.map((pedido) => (
              <View key={pedido.id} style={styles.card}>
                <Pressable
                  onPress={() =>
                    setExpandedPedidoId(
                      expandedPedidoId === pedido.id ? null : pedido.id
                    )
                  }
                >
                  <Text style={styles.meta}>Pedido #{pedido.num_pedido}</Text>
                  <Text style={styles.meta}>
                    Status: {pedido.status_preparo}
                  </Text>
                  <Text style={styles.meta}>
                    Pagamento: {pedido.status_pagamento}
                  </Text>
                  <Text style={styles.meta}>
                    Total: R$ {pedido.valor_total.toFixed(2)}
                  </Text>
                  <Text style={styles.expandHint}>
                    {expandedPedidoId === pedido.id
                      ? "Ocultar itens"
                      : "Ver itens"}
                  </Text>
                </Pressable>
                {expandedPedidoId === pedido.id ? (
                  pedido.itens?.length ? (
                    <View style={styles.itemsList}>
                      {pedido.itens.map((item) => (
                        <View key={item.id} style={styles.itemRow}>
                          <Text style={styles.itemText}>
                            Item #{item.num_item} - {item.quantidade}x
                          </Text>
                          <Text style={styles.itemText}>
                            Subtotal: R$ {item.subtotal.toFixed(2)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.empty}>Sem itens neste pedido.</Text>
                  )
                ) : null}
              </View>
            ))
          ) : (
            <Text style={styles.empty}>Nenhum pedido registrado.</Text>
          )}
          <Pressable
            onPress={handleCardapio}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.secondaryButtonPressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>Cardapio</Text>
          </Pressable>
          <Pressable
            onPress={handleFinalizarMesa}
            disabled={closing}
            style={({ pressed }) => [
              styles.dangerButton,
              pressed && styles.dangerButtonPressed,
              closing && styles.dangerButtonDisabled,
            ]}
          >
            <Text style={styles.dangerButtonText}>Finalizar mesa</Text>
          </Pressable>
        </View>
      </ScrollView>
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
  scrollBody: {
    paddingBottom: 24,
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
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
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
  expandHint: {
    color: "#101828",
    fontWeight: "600",
    marginTop: 6,
  },
  itemsList: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  itemRow: {
    marginBottom: 6,
  },
  itemText: {
    color: "#475467",
  },
  empty: {
    color: "#667085",
    marginBottom: 8,
  },
  error: {
    color: "#B42318",
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: "#101828",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12,
  },
  primaryButtonPressed: {
    opacity: 0.85,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#101828",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  secondaryButtonPressed: {
    opacity: 0.85,
  },
  secondaryButtonText: {
    color: "#101828",
    fontSize: 16,
    fontWeight: "600",
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: "#D92D20",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 10,
  },
  dangerButtonPressed: {
    opacity: 0.85,
  },
  dangerButtonDisabled: {
    opacity: 0.6,
  },
  dangerButtonText: {
    color: "#D92D20",
    fontSize: 16,
    fontWeight: "600",
  },
});
