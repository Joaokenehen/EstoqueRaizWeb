import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Input } from "../components/Input";
import { RootStackParamList } from "../types/navigation";
import api from "../services/api";
import Toast from "react-native-toast-message";
import { Eye, EyeOff } from "lucide-react-native";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function Login({ navigation }: Props) {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) return;
    setLoading(true);
    try {
      const response = await api.post("/api/auth/login", {
        email,
        senha,
      });

      const data = response.data;

      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("usuario", JSON.stringify(data.usuario));
      await AsyncStorage.setItem("nome", data.usuario.nome);
      await AsyncStorage.setItem("cargo", data.usuario.cargo);

      navigation.navigate("Dashboard");
    } catch (error: any) {
      setLoginError(true);
      if (error.response) {
        Toast.show({
          type: "error",
          text1: "Erro no Login",
          text2: error.response.data.message || "Email ou senha incorretos",
          position: "bottom",
          visibilityTime: 4000,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Erro de Conexão",
          text2: "Erro de conexão. Verifique sua internet.",
          position: "bottom",
          visibilityTime: 4000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.icon}>🌱</Text>
            <Text style={styles.titulo}>Entrar</Text>
            <Text style={styles.subtitulo}>Acesse sua conta para continuar</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail</Text>
              <Input
                placeholder="seu@email.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setLoginError(false);
                }}
                style={[styles.input, loginError && styles.inputError]}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Senha</Text>
                <TouchableOpacity onPress={() => navigation.navigate("EsqueciSenha" as any)}>
                  <Text style={styles.esqueciSenhaLink}>Esqueceu a senha?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <Input
                  placeholder="Sua senha"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!mostrarSenha}
                  value={senha}
                  onChangeText={(text) => {
                    setSenha(text);
                    setLoginError(false);
                  }}
                  style={[styles.input, loginError && styles.inputError, styles.inputWithIcon]}
                  textContentType={Platform.OS === "ios" ? "oneTimeCode" : "none"}
                />
                <TouchableOpacity style={styles.iconButton} onPress={() => setMostrarSenha(!mostrarSenha)}>
                  {mostrarSenha ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.botao, (!email || !senha || loading) && styles.botaoDesabilitado]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={!email || !senha || loading}
            >
              <Text style={styles.botaoTexto}>{loading ? "Entrando..." : "Entrar"}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footer}>
            <Text style={styles.loginTexto}>
              Não tem uma conta?{" "}
              <Text style={styles.loginLink} onPress={() => navigation.navigate("Cadastro" as any)}>Crie uma aqui</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFCF0",
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "NunitoSans_700Bold",
    color: "#111827",
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 15,
    fontFamily: "NunitoSans_400Regular",
    color: "#6B7280",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputContainer: {
    position: "relative",
    justifyContent: "center",
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "NunitoSans_600SemiBold",
    color: "#374151",
  },
  esqueciSenhaLink: {
    fontSize: 12,
    fontFamily: "NunitoSans_600SemiBold",
    color: "#2D5A27",
  },
  input: {
    height: 52,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "NunitoSans_400Regular",
    color: "#111827",
  },
  inputWithIcon: {
    paddingRight: 45,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  iconButton: {
    position: "absolute",
    right: 15,
  },
  botao: {
    backgroundColor: "#2D5A27",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#2D5A27",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  botaoDesabilitado: {
    backgroundColor: "#9CA3AF",
    elevation: 0,
  },
  botaoTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "NunitoSans_600SemiBold",
  },
  footer: {
    marginTop: 32,
    alignItems: "center",
  },
  loginTexto: {
    fontSize: 14,
    fontFamily: "NunitoSans_400Regular",
    color: "#6B7280",
  },
  loginLink: {
    color: "#2D5A27", // Cor da marca
    fontWeight: "600",
    fontFamily: "NunitoSans_600SemiBold",
  },
});
