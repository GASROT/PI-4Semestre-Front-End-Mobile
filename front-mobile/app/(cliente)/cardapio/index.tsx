import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  Pressable,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";

import { BottomNav } from "../../../components/bottom-nav";
import { CART_ITEMS_KEY } from "../../../constants/api";
import { listProdutos } from "../../../services/produtos";
import { obterComandaAtiva } from "../../../services/mesa-conexao";
import { createComanda } from "../../../services/comandas";
import type { Produto } from "../../../types/produtos";

interface CartItem {
  produtoId: string;
  produtoNome: string;
  precoUnitario: number;
  quantidade: number;
}

interface CartPayload {
  mesaId: string;
  comandaId: string;
  items: CartItem[];
}

export default function CardapioScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mesaId = typeof params.mesaId === "string" ? params.mesaId : "";
  const comandaId = typeof params.comandaId === "string" ? params.comandaId : "";
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const loadProdutos = async () => {
    setError(null);
    try {
      const data = await listProdutos();
      setProdutos(data);
    } catch (err) {
      const message =
        typeof err === "object" && err && "message" in err
          ? String((err as { message?: string }).message)
          : "Falha ao carregar produtos";
      setError(message);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      await loadProdutos();
      if (active) {
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const raw = await AsyncStorage.getItem(CART_ITEMS_KEY);
      if (!active) return;
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as CartPayload;
          if (parsed.mesaId === mesaId) {
            setCartItems(parsed.items ?? []);
          }
        } catch {
          setCartItems([]);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [mesaId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProdutos();
    setRefreshing(false);
  };

  const handleSelectProduto = async (produto: Produto) => {
    if (actionLoading) return;
    if (!mesaId) {
      setError("Mesa nao informada");
      return;
    }

    setActionLoading(true);
    setError(null);
    let activeComandaId = comandaId;

    try {
      if (!activeComandaId) {
        const comandaAtiva = await obterComandaAtiva(mesaId);
        if (comandaAtiva?.id) {
          activeComandaId = comandaAtiva.id;
        } else {
          const criada = await createComanda({ mesa_id: mesaId });
          activeComandaId = criada.id;
        }
      }
    } catch (err) {
      const message =
        typeof err === "object" && err && "message" in err
          ? String((err as { message?: string }).message)
          : "Falha ao obter comanda";
      setError(message);
      setActionLoading(false);
      return;
    }

    const updatedItems = [...cartItems];
    const existingIndex = updatedItems.findIndex(
      (item) => item.produtoId === produto.id
    );
    if (existingIndex >= 0) {
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantidade: updatedItems[existingIndex].quantidade + 1,
      };
    } else {
      updatedItems.push({
        produtoId: produto.id,
        produtoNome: produto.nome,
        precoUnitario: produto.preco_unitario,
        quantidade: 1,
      });
    }

    const payload: CartPayload = {
      mesaId,
      comandaId: activeComandaId,
      items: updatedItems,
    };

    try {
      await AsyncStorage.setItem(CART_ITEMS_KEY, JSON.stringify(payload));
      setCartItems(updatedItems);
    } finally {
      setActionLoading(false);
    }
  };

  const updateCart = async (items: CartItem[]) => {
    const payload: CartPayload = {
      mesaId,
      comandaId,
      items,
    };
    await AsyncStorage.setItem(CART_ITEMS_KEY, JSON.stringify(payload));
    setCartItems(items);
  };

  const handleIncrease = async (produtoId: string) => {
    const updated = cartItems.map((item) =>
      item.produtoId === produtoId
        ? { ...item, quantidade: item.quantidade + 1 }
        : item
    );
    await updateCart(updated);
  };

  const handleDecrease = async (produtoId: string) => {
    const updated = cartItems
      .map((item) =>
        item.produtoId === produtoId
          ? { ...item, quantidade: item.quantidade - 1 }
          : item
      )
      .filter((item) => item.quantidade > 0);
    await updateCart(updated);
  };

  const handleRemove = async (produtoId: string) => {
    const updated = cartItems.filter((item) => item.produtoId !== produtoId);
    await updateCart(updated);
  };

  const handleCheckout = () => {
    if (!cartItems.length) {
      setError("Carrinho vazio");
      return;
    }
    router.push("/pagamento");
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
        <Text style={styles.title}>Cardapio</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <FlatList
          data={produtos}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelectProduto(item)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
            >
              <Text style={styles.cardTitle}>{item.nome}</Text>
              <Text style={styles.meta}>
                Preco: R$ {item.preco_unitario.toFixed(2)}
              </Text>
              <Text style={styles.meta}>Estoque: {item.qtd_estoque}</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>Nenhum produto disponível</Text>
          }
        />
        <View style={styles.cartSummary}>
          <Text style={styles.cartText}>
            Itens no carrinho: {cartItems.reduce((sum, item) => sum + item.quantidade, 0)}
          </Text>
          <Text style={styles.cartText}>
            Total: R$ {cartItems
              .reduce((sum, item) => sum + item.precoUnitario * item.quantidade, 0)
              .toFixed(2)}
          </Text>
          {cartItems.length ? (
            <View style={styles.cartList}>
              {cartItems.map((item) => (
                <View key={item.produtoId} style={styles.cartItem}>
                  <View style={styles.cartInfo}>
                    <Text style={styles.cartItemName}>{item.produtoNome}</Text>
                    <Text style={styles.cartItemMeta}>
                      R$ {item.precoUnitario.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.cartControls}>
                    <Pressable
                      onPress={() => handleDecrease(item.produtoId)}
                      style={({ pressed }) => [
                        styles.cartButton,
                        pressed && styles.cartButtonPressed,
                      ]}
                    >
                      <Text style={styles.cartButtonText}>-</Text>
                    </Pressable>
                    <Text style={styles.cartQty}>{item.quantidade}</Text>
                    <Pressable
                      onPress={() => handleIncrease(item.produtoId)}
                      style={({ pressed }) => [
                        styles.cartButton,
                        pressed && styles.cartButtonPressed,
                      ]}
                    >
                      <Text style={styles.cartButtonText}>+</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleRemove(item.produtoId)}
                      style={({ pressed }) => [
                        styles.cartRemove,
                        pressed && styles.cartButtonPressed,
                      ]}
                    >
                      <Text style={styles.cartRemoveText}>Remover</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
          <Pressable
            onPress={handleCheckout}
            style={({ pressed }) => [
              styles.checkoutButton,
              pressed && styles.checkoutButtonPressed,
            ]}
          >
            <Text style={styles.checkoutText}>Ir para pagamento</Text>
          </Pressable>
        </View>
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
  cardPressed: {
    opacity: 0.85,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  meta: {
    color: "#475467",
  },
  error: {
    color: "#B42318",
    marginBottom: 8,
  },
  empty: {
    color: "#667085",
  },
  cartSummary: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 12,
    marginTop: 8,
  },
  cartText: {
    color: "#475467",
    marginBottom: 8,
  },
  cartList: {
    marginBottom: 10,
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  cartInfo: {
    flex: 1,
    marginRight: 10,
  },
  cartItemName: {
    fontWeight: "600",
    color: "#101828",
  },
  cartItemMeta: {
    color: "#667085",
  },
  cartControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  cartButton: {
    borderWidth: 1,
    borderColor: "#101828",
    borderRadius: 8,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  cartButtonPressed: {
    opacity: 0.85,
  },
  cartButtonText: {
    color: "#101828",
    fontWeight: "600",
  },
  cartQty: {
    marginHorizontal: 8,
    fontWeight: "600",
    color: "#101828",
  },
  cartRemove: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#B42318",
  },
  cartRemoveText: {
    color: "#B42318",
    fontWeight: "600",
    fontSize: 12,
  },
  checkoutButton: {
    backgroundColor: "#101828",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  checkoutButtonPressed: {
    opacity: 0.85,
  },
  checkoutText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
