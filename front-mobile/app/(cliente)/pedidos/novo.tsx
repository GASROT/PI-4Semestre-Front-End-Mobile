import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { addItemPedido, createPedido } from "../../services/pedidos";

export default function NovoPedidoScreen() {
  const params = useLocalSearchParams();
  const initialMesaId = typeof params.mesaId === "string" ? params.mesaId : "";
  const [mesaId, setMesaId] = useState(initialMesaId);
  const [numPedido, setNumPedido] = useState("");
  const [produtoId, setProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [numItem, setNumItem] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setResultado(null);
    setLoading(true);

    try {
      const pedido = await createPedido({
        mesa_id: mesaId.trim(),
        num_pedido: Number(numPedido),
      });

      await addItemPedido(pedido.id, {
        produto_id: produtoId.trim(),
        quantidade: Number(quantidade),
        num_item: numItem ? Number(numItem) : undefined,
      });

      setResultado(`Pedido ${pedido.num_pedido} criado`);
    } catch (err) {
      const message =
        typeof err === "object" && err && "message" in err
          ? String((err as { message?: string }).message)
          : "Falha ao criar pedido";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Novo Pedido</Text>
      <TextInput
        placeholder="Mesa ID"
        style={styles.input}
        value={mesaId}
        onChangeText={setMesaId}
      />
      <TextInput
        placeholder="Numero do pedido"
        style={styles.input}
        value={numPedido}
        onChangeText={setNumPedido}
        keyboardType="number-pad"
      />
      <TextInput
        placeholder="Produto ID"
        style={styles.input}
        value={produtoId}
        onChangeText={setProdutoId}
      />
      <TextInput
        placeholder="Quantidade"
        style={styles.input}
        value={quantidade}
        onChangeText={setQuantidade}
        keyboardType="decimal-pad"
      />
      <TextInput
        placeholder="Numero do item (opcional)"
        style={styles.input}
        value={numItem}
        onChangeText={setNumItem}
        keyboardType="number-pad"
      />
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
          {loading ? "Enviando..." : "Criar pedido"}
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
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 12,
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
