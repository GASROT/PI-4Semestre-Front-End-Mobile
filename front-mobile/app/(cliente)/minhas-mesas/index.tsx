import { StyleSheet, Text, View } from "react-native";

import { BottomNav } from "../../../components/bottom-nav";

export default function MinhasMesasScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Minhas Mesas</Text>
        <Text style={styles.subtitle}>Em breve</Text>
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
    marginBottom: 8,
  },
  subtitle: {
    color: "#667085",
  },
});
