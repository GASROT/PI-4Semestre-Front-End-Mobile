import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { createUsuario } from "../../../services/usuarios";
import { login } from "../../../services/auth";

export default function RegisterScreen() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cpf, setCpf] = useState("");
  const [celular, setCelular] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setSuccess(false);

    if (!nome.trim() || !email.trim() || !senha) {
      setError("Nome, email e senha sao obrigatorios");
      return;
    }

    setLoading(true);
    try {
      await createUsuario({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        cpf: cpf.trim() || undefined,
        celular: celular.trim() || undefined,
        roles: ["CLIENTE"],
      });
      await login({ email: email.trim(), senha });
      setSuccess(true);
      router.replace("/profile");
    } catch (err) {
      const message =
        typeof err === "object" && err && "message" in err
          ? String((err as { message?: string }).message)
          : "Falha ao registrar";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar</Text>
      <TextInput
        placeholder="Nome"
        style={styles.input}
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        inputMode="email"
        keyboardType="email-address"
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Senha"
        secureTextEntry
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
      />
      <TextInput
        placeholder="CPF (opcional)"
        style={styles.input}
        value={cpf}
        onChangeText={setCpf}
      />
      <TextInput
        placeholder="Celular (opcional)"
        style={styles.input}
        value={celular}
        onChangeText={setCelular}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>Cadastro realizado</Text> : null}
      <Pressable
        disabled={loading}
        onPress={onSubmit}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          loading && styles.buttonDisabled,
        ]}
      >
        <Text style={styles.buttonText}>
          {loading ? "Salvando..." : "Cadastrar"}
        </Text>
      </Pressable>
      <Pressable onPress={() => router.push("/login")}>
        <Text style={styles.link}>Ja tenho conta</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 12,
    justifyContent: "center",
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
  },
  success: {
    color: "#067647",
  },
  link: {
    color: "#101828",
    textAlign: "center",
    fontWeight: "600",
  },
});
