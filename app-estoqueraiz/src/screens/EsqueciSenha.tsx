import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
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
import Toast from "react-native-toast-message";
import { Eye, EyeOff } from "lucide-react-native";
import api from "../services/api";
import { RootStackParamList } from "../types/navigation";

export default function EsqueciSenha() {
  const navigation = useNavigation();

  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState(""); // Novo estado
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false); // Novo olhinho
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const camposEtapa1Preenchidos = email;
  const camposEtapa2Preenchidos = codigo && novaSenha && confirmarSenha;

  const solicitarCodigo = async () => {
    if (!camposEtapa1Preenchidos) return;
    setLoading(true);

    try {
      await api.post("/api/usuarios/recuperar-senha", { email });
      
      Toast.show({
        type: "success",
        text1: "Código Enviado",
        text2: "Verifique sua caixa de entrada.",
        position: "bottom",
        visibilityTime: 4000,
      });
      setEtapa(2);
    } catch (error: any) {
      setErrors({ email: "E-mail não encontrado ou inválido." });
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: error.response?.data?.message || "Erro ao solicitar o código. Tente novamente.",
        position: "bottom",
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const redefinirSenha = async () => {
    if (!camposEtapa2Preenchidos) return;

    // 👇 Nova validação de senhas iguais no APP
    if (novaSenha !== confirmarSenha) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "As senhas não coincidem. Verifique e tente novamente.",
        position: "bottom",
        visibilityTime: 4000,
      });
      setErrors({ novaSenha: "As senhas não coincidem", confirmarSenha: "As senhas não coincidem" });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await api.post("/api/usuarios/redefinir-senha", {
        email,
        codigoRecuperacao: codigo,
        novaSenha,
      });

      Toast.show({
        type: "success",
        text1: "Sucesso!",
        text2: "Senha redefinida. Faça login para continuar.",
        position: "bottom",
        visibilityTime: 4000,
      });
      
      setTimeout(() => navigation.navigate("Login" as never), 2000);
    } catch (error: any) {
      setErrors({ codigo: "Código inválido", novaSenha: "Senha fraca" });
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: error.response?.data?.message || "Código inválido ou senha fraca.",
        position: "bottom",
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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
            <Text style={styles.titulo}>Recuperar Senha</Text>
            <Text style={styles.subtitulo}>
              {etapa === 1 
                ? "Enviaremos um código para o seu e-mail" 
                : "Crie uma nova senha de acesso"}
            </Text>
          </View>

          <View style={styles.card}>
            {etapa === 1 ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Seu E-mail Cadastrado</Text>
                  <Input
                    placeholder="exemplo@estoqueraiz.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    style={[styles.input, !!errors.email && styles.inputError]}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.botao, (!camposEtapa1Preenchidos || loading) && styles.botaoDesabilitado]}
                  onPress={solicitarCodigo}
                  disabled={!camposEtapa1Preenchidos || loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.botaoTexto}>
                    {loading ? "Enviando..." : "Receber Código"}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Código de 6 Dígitos</Text>
                  <Input
                    placeholder="000000"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    maxLength={6}
                    value={codigo}
                    onChangeText={(t) => setCodigo(t.replace(/\D/g, ''))}
                    style={[styles.input, { textAlign: "center", letterSpacing: 5 }, !!errors.codigo && styles.inputError]}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nova Senha</Text>
                  <View style={styles.inputContainer}>
                    <Input
                      placeholder="••••••••"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!mostrarSenha}
                      value={novaSenha}
                      onChangeText={setNovaSenha}
                      style={[styles.input, styles.inputWithIcon, !!errors.novaSenha && styles.inputError]}
                    />
                    <TouchableOpacity style={styles.iconButton} onPress={() => setMostrarSenha(!mostrarSenha)}>
                      {mostrarSenha ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirmar Senha</Text>
                  <View style={styles.inputContainer}>
                    <Input
                      placeholder="••••••••"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!mostrarConfirmarSenha}
                      value={confirmarSenha}
                      onChangeText={setConfirmarSenha}
                      style={[styles.input, styles.inputWithIcon, !!errors.confirmarSenha && styles.inputError]}
                    />
                    <TouchableOpacity style={styles.iconButton} onPress={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}>
                      {mostrarConfirmarSenha ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.botao, (!camposEtapa2Preenchidos || loading) && styles.botaoDesabilitado]}
                  onPress={redefinirSenha}
                  disabled={!camposEtapa2Preenchidos || loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.botaoTexto}>
                    {loading ? "Validando..." : "Alterar Senha"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>{"<"} Voltar para o Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFCF0" },
  scrollView: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingBottom: 40 },
  content: { flex: 1, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 32 },
  icon: { fontSize: 48, marginBottom: 16 },
  titulo: { fontSize: 28, fontWeight: "700", fontFamily: "NunitoSans_700Bold", color: "#111827" },
  subtitulo: { fontSize: 15, fontFamily: "NunitoSans_400Regular", color: "#6B7280", textAlign: "center", marginTop: 8 },
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
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", fontFamily: "NunitoSans_600SemiBold", color: "#374151", marginBottom: 8 },
  inputContainer: { position: 'relative', justifyContent: 'center' },
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
    position: 'absolute',
    right: 15,
  },
  botao: {
    backgroundColor: "#2D5A27",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#2D5A27",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  botaoDesabilitado: { backgroundColor: "#9CA3AF", elevation: 0 },
  botaoTexto: { color: "#FFFFFF", fontSize: 16, fontWeight: "600", fontFamily: "NunitoSans_600SemiBold" },
  backButton: { marginTop: 32, alignItems: "center" },
  backButtonText: { color: "#2D5A27", fontSize: 14, fontFamily: "NunitoSans_600SemiBold" },
});