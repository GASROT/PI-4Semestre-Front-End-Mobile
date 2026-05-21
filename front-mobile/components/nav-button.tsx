import { Pressable, StyleSheet, Text } from "react-native";

type NavButtonProps = {
  label: string;
  active?: boolean;
  onPress: () => void;
};

export function NavButton({ label, active, onPress }: NavButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  text: {
    color: "#667085",
    fontWeight: "600",
  },
  textActive: {
    color: "#101828",
  },
});
