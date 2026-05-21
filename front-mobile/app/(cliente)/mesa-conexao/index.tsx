import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AUTH_TOKEN_KEY } from "../../../constants/api";
import { BottomNav } from "../../../components/bottom-nav";
import { obterComandaAtiva, validarTokenMesa } from "../../../services/mesa-conexao";
import { createUsuarioMesaLink } from "../../../services/usuario-mesas";

export default function MesaConexaoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [mesaId, setMesaId] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const tokenValue = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (active) {
        setNeedsLogin(!tokenValue);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const mesaParam = typeof params.mesaId === "string" ? params.mesaId : "";
    const tokenParam = typeof params.token === "string" ? params.token : "";

    if (mesaParam) {
      setMesaId(mesaParam);
    }
    if (tokenParam) {
      setToken(tokenParam);
    }

    if (mesaParam && tokenParam) {
      (async () => {
        setError(null);
        setResultado(null);
        setLoading(true);
        try {
          const validacao = await validarTokenMesa(mesaParam, tokenParam);
          if (!validacao.valido) {
            throw new Error("Token invalido");
          }
          const comanda = await obterComandaAtiva(mesaParam);
          try {
            await createUsuarioMesaLink(mesaParam);
          } catch (linkError) {
            if (
              typeof linkError === "object" &&
              linkError &&
              "message" in linkError &&
              String((linkError as { message?: string }).message).includes(
                "Vinculo usuario-mesa ja existe"
              )
            ) {
              // Vinculo ja existe, segue fluxo normal.
            } else {
              throw linkError;
            }
          }
          setResultado(
            `Mesa ${validacao.mesa_numero} valida. Comanda: ${
              comanda?.id ?? "nenhuma"
            }`
          );
          router.replace({
            pathname: "/mesa-resumo",
            params: { mesaId: mesaParam },
          });
        } catch (err) {
          const message =
            typeof err === "object" && err && "message" in err
              ? String((err as { message?: string }).message)
              : "Falha ao validar mesa";
          setError(message);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [params.mesaId, params.token]);

  const onSubmit = async () => {
    setError(null);
    setResultado(null);
    setLoading(true);

    try {
      const validacao = await validarTokenMesa(mesaId.trim(), token.trim());
      if (!validacao.valido) {
        throw new Error("Token invalido");
      }
      const comanda = await obterComandaAtiva(mesaId.trim());
      try {
        await createUsuarioMesaLink(mesaId.trim());
      } catch (linkError) {
        if (
          typeof linkError === "object" &&
          linkError &&
          "message" in linkError &&
          String((linkError as { message?: string }).message).includes(
            "Vinculo usuario-mesa ja existe"
          )
        ) {
          // Vinculo ja existe, segue fluxo normal.
        } else {
          throw linkError;
        }
      }

      setResultado(
        `Mesa ${validacao.mesa_numero} valida. Comanda: ${
          comanda?.id ?? "nenhuma"
        }`
      );
      router.replace({
        pathname: "/mesa-resumo",
        params: { mesaId: mesaId.trim() },
      });
    } catch (err) {
      const message =
        typeof err === "object" && err && "message" in err
          ? String((err as { message?: string }).message)
          : "Falha ao validar mesa";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Conexao com Mesa</Text>
        <TextInput
          placeholder="Mesa ID"
          style={styles.input}
          value={mesaId}
          onChangeText={setMesaId}
        />
        <TextInput
          placeholder="Token"
          style={styles.input}
          value={token}
          onChangeText={setToken}
        />
        {needsLogin ? (
          <Text style={styles.notice}>Login necessario para validar mesa.</Text>
        ) : null}
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
            {loading ? "Validando..." : "Validar"}
          </Text>
        </Pressable>
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
  notice: {
    color: "#667085",
    marginBottom: 8,
  },
});
