import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { BottomNav } from "../../../components/bottom-nav";
import { getPerfil } from "../../../services/perfil";
import type { PerfilUsuario } from "../../../types/perfil";

export default function ProfileScreen() {
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getPerfil();
        if (active) {
          setPerfil(data);
        }
      } catch (err) {
        const message =
          typeof err === "object" && err && "message" in err
            ? String((err as { message?: string }).message)
            : "Falha ao carregar perfil";
        if (active) {
          setError(message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

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
        <Text style={styles.title}>Perfil</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {perfil ? (
          <View style={styles.card}>
            <Text style={styles.label}>ID</Text>
            <Text style={styles.value}>{perfil.id ?? "-"}</Text>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{perfil.email ?? "-"}</Text>
          </View>
        ) : null}
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
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  label: {
    fontSize: 12,
    color: "#667085",
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
  },
  error: {
    color: "#B42318",
    marginBottom: 8,
  },
});
