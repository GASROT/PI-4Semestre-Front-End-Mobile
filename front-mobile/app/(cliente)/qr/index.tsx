import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { listMesas } from "../../../services/mesas";

export default function QrScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [manualNumero, setManualNumero] = useState("");
  const [manualToken, setManualToken] = useState("");

  const parseQr = (value: string) => {
    const numeroMatch = value.match(/\/m\/(\d+)/);
    const tokenMatch = value.match(/[?&]t=([^&]+)/);
    if (!numeroMatch || !tokenMatch) {
      return null;
    }
    return { numero: Number(numeroMatch[1]), token: tokenMatch[1] };
  };

  const handleScan = async (value: string) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    setLastCode(value);

    try {
      const parsed = parseQr(value);
      if (!parsed) {
        setError("QR invalido");
        return;
      }

      const mesas = await listMesas();
      const mesa = mesas.find((item) => item.numero === parsed.numero);
      if (!mesa) {
        setError("Mesa nao encontrada");
        return;
      }

      router.replace({
        pathname: "/mesa-conexao",
        params: { mesaId: mesa.id, token: parsed.token },
      });
    } catch (err) {
      const message =
        typeof err === "object" && err && "message" in err
          ? String((err as { message?: string }).message)
          : "Falha ao processar QR";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const handleManualLink = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);

    try {
      const numero = Number(manualNumero.trim());
      const token = manualToken.trim();
      if (!numero || !token) {
        setError("Informe numero da mesa e token");
        return;
      }

      const mesas = await listMesas();
      const mesa = mesas.find((item) => item.numero === numero);
      if (!mesa) {
        setError("Mesa nao encontrada");
        return;
      }

      router.replace({
        pathname: "/mesa-conexao",
        params: { mesaId: mesa.id, token },
      });
    } catch (err) {
      const message =
        typeof err === "object" && err && "message" in err
          ? String((err as { message?: string }).message)
          : "Falha ao vincular mesa";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Carregando camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Permissao da camera</Text>
        <Text style={styles.subtitle}>Precisamos de acesso para ler QR Code.</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Permitir</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={busy ? undefined : ({ data }) => handleScan(data)}
      />
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Leitor QR</Text>
        <Text style={styles.footerText}>
          {lastCode ? `Codigo: ${lastCode}` : "Aponte para o QR Code"}
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.manualBlock}>
          <Text style={styles.manualTitle}>Vinculo manual (teste)</Text>
          <TextInput
            style={styles.input}
            placeholder="Numero da mesa"
            keyboardType="numeric"
            value={manualNumero}
            onChangeText={setManualNumero}
          />
          <TextInput
            style={styles.input}
            placeholder="Token"
            value={manualToken}
            onChangeText={setManualToken}
          />
          <Pressable
            style={({ pressed }) => [
              styles.linkButton,
              pressed && styles.linkButtonPressed,
            ]}
            onPress={handleManualLink}
            disabled={busy}
          >
            <Text style={styles.linkButtonText}>
              {busy ? "Vinculando..." : "Vincular mesa"}
            </Text>
          </Pressable>
        </View>
        {lastCode ? (
          <Pressable
            style={styles.resetButton}
            onPress={() => {
              setLastCode(null);
              setError(null);
            }}
          >
            <Text style={styles.resetText}>Ler novamente</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F1A",
  },
  camera: {
    flex: 1,
  },
  footer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  footerText: {
    color: "#667085",
  },
  error: {
    color: "#B42318",
    marginTop: 6,
  },
  manualBlock: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  manualTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  linkButton: {
    backgroundColor: "#101828",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  linkButtonPressed: {
    opacity: 0.85,
  },
  linkButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  resetButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#101828",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resetText: {
    color: "#101828",
    fontWeight: "600",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F8FAFC",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  subtitle: {
    color: "#667085",
    textAlign: "center",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#101828",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
