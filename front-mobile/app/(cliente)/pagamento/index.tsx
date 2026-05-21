import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { CART_ITEMS_KEY } from "../../../constants/api";
import {
  addProdutoComanda,
  finalizarComanda,
  listPedidosComanda,
} from "../../../services/comandas";
import { updatePedidoStatus } from "../../../services/pedidos";
import type { MetodoPagamento } from "../../../types/comandas";

interface PendingPedidoPayload {
  mesaId: string;
  comandaId: string;
  items: {
    produtoId: string;
    produtoNome: string;
    precoUnitario: number;
    quantidade: number;
  }[];
}

export default function PagamentoScreen() {
  const [comandaId, setComandaId] = useState("");
  const [metodo, setMetodo] = useState<MetodoPagamento>("PIX");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingPedido, setPendingPedido] = useState<PendingPedidoPayload | null>(
    null
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const raw = await AsyncStorage.getItem(CART_ITEMS_KEY);
      if (!active) return;
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as PendingPedidoPayload;
          setPendingPedido(parsed);
        } catch {
          setPendingPedido(null);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const onSubmit = async () => {
    setError(null);
    setResultado(null);
    setLoading(true);

    try {
      if (pendingPedido) {
        const pedidoIds = new Set<string>();
        for (const item of pendingPedido.items) {
          const createdItem = await addProdutoComanda(pendingPedido.comandaId, {
            produto_id: item.produtoId,
            quantidade: item.quantidade,
          });
          if (createdItem.pedido_id) {
            pedidoIds.add(createdItem.pedido_id);
          }
        }

        if (pedidoIds.size === 0) {
          const pedidos = await listPedidosComanda(pendingPedido.comandaId);
          const lastPedido = pedidos[pedidos.length - 1];
          if (lastPedido?.id) {
            pedidoIds.add(lastPedido.id);
          }
        }

        for (const pedidoId of pedidoIds) {
          await updatePedidoStatus(pedidoId, {
            status_pagamento: "PAGO",
            status_preparo: "EM_PREPARO",
          });
        }

        await AsyncStorage.removeItem(CART_ITEMS_KEY);
        setPendingPedido(null);
        setResultado("Pedido criado e enviado");
        return;
      }

      const comanda = await finalizarComanda(comandaId.trim(), {
        metodo_pagamento: metodo,
      });
      setResultado(`Comanda ${comanda.id} finalizada`);
    } catch (err) {
      const message =
        typeof err === "object" && err && "message" in err
          ? String((err as { message?: string }).message)
          : "Falha ao finalizar comanda";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pagamento</Text>
      {pendingPedido ? (
        <View style={styles.card}>
          <Text style={styles.meta}>Mesa: {pendingPedido.mesaId}</Text>
          {pendingPedido.items.map((item) => (
            <View key={item.produtoId} style={styles.cartRow}>
              <Text style={styles.meta}>
                {item.produtoNome} ({item.quantidade}x)
              </Text>
              <Text style={styles.meta}>
                R$ {(item.precoUnitario * item.quantidade).toFixed(2)}
              </Text>
            </View>
          ))}
          <Text style={styles.meta}>
            Total: R$ {pendingPedido.items
              .reduce((sum, item) => sum + item.precoUnitario * item.quantidade, 0)
              .toFixed(2)}
          </Text>
        </View>
      ) : (
        <TextInput
          placeholder="Comanda ID"
          style={styles.input}
          value={comandaId}
          onChangeText={setComandaId}
        />
      )}

      <Text style={styles.label}>Metodo de pagamento</Text>
      <View style={styles.row}>
        {(["PIX", "CARTAO", "DINHEIRO"] as MetodoPagamento[]).map(
          (item) => (
            <Pressable
              key={item}
              onPress={() => setMetodo(item)}
              style={[
                styles.pill,
                metodo === item && styles.pillActive,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  metodo === item && styles.pillTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          )
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {resultado ? <Text style={styles.success}>{resultado}</Text> : null}

      <Pressable
        onPress={onSubmit}
        disabled={loading}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          loading && styles.buttonDisabled,
        ]}
      >
        <Text style={styles.buttonText}>
          {loading ? "Processando..." : "Finalizar"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F8FAFC",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cartRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  meta: {
    color: "#475467",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 12,
  },
  label: {
    color: "#475467",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  pill: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
  },
  pillActive: {
    backgroundColor: "#101828",
    borderColor: "#101828",
  },
  pillText: {
    color: "#101828",
    fontWeight: "600",
  },
  pillTextActive: {
    color: "#FFFFFF",
  },
  input: {
    borderColor: "#D0D5DD",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#101828",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "#B42318",
    marginBottom: 8,
  },
  success: {
    color: "#067647",
    marginBottom: 8,
  },
});
