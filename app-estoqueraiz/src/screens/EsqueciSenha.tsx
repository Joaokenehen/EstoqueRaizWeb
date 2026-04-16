import { useNavigation } from "@react-navigation/native";
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
import api from "../services/api";
import Toast from "react-native-toast-message";
import { Eye, EyeOff } from "lucide-react-native";

export default function EsqueciSenha() {
  const navigation = useNavigation();

  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const solicitarCodigo = async () => {
    if (!email) return;
    setLoading(true);

    try {
      // Fazendo a requisição direto aqui usando sua instância de api
      await api.post("/api/usuarios/solicitar-recuperacao-senha", { email });
      
      Toast.show({
        type: "success",
        text1: "Código Enviado",
        text2: "Verifique sua caixa de entrada.",
        position: "bottom",
        visibilityTime: 4000,
      });
      setEtapa(2);
    } catch (error: any) {
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
    if (!codigo || !novaSenha) return;
    setLoading(true);

    try {
      // Fazendo a requisição com a rota correta para alterar a senha
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
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>{"<"} Voltar para o Login</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.titulo}>Recuperar Senha</Text>
          <Text style={styles.subtitulo}>
            {etapa === 1 
              ? "Enviaremos um código para o seu e-mail" 
              : "Crie uma nova senha de acesso"}
          </Text>
        </View>

        <View style={styles.form}>
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
                  style={styles.input}
                />
              </View>

              <TouchableOpacity
                style={[styles.botao, loading && styles.botaoDisabled]}
                onPress={solicitarCodigo}
                disabled={loading}
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
                  style={[styles.input, { textAlign: "center", letterSpacing: 5 }]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nova Senha</Text>
                <View style={{ position: 'relative', justifyContent: 'center' }}>
                  <Input
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!mostrarSenha}
                    value={novaSenha}
                    onChangeText={setNovaSenha}
                    style={styles.input}
                  />
                  <TouchableOpacity
                    style={{ position: 'absolute', right: 15 }}
                    onPress={() => setMostrarSenha(!mostrarSenha)}
                  >
                    {mostrarSenha ? (
                      <EyeOff size={20} color="#9CA3AF" />
                    ) : (
                      <Eye size={20} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.botao, loading && styles.botaoDisabled]}
                onPress={redefinirSenha}
                disabled={loading}
              >
                <Text style={styles.botaoTexto}>
                  {loading ? "Validando..." : "Alterar Senha"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollView: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, backgroundColor: "#FFFFFF" },
  backButton: { marginTop: 60, marginBottom: 10 },
  backButtonText: { color: "#044001", fontSize: 16, fontFamily: "NunitoSans_600SemiBold" },
  header: { alignItems: "center", marginBottom: 32, marginTop: 20 },
  titulo: { fontSize: 28, fontWeight: "700", fontFamily: "NunitoSans_700Bold", color: "#111827" },
  subtitulo: { fontSize: 15, fontFamily: "NunitoSans_400Regular", color: "#6B7280", textAlign: "center", marginTop: 8 },
  form: { flex: 1 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "600", fontFamily: "NunitoSans_600SemiBold", color: "#374151", marginBottom: 8 },
  input: { height: 50, backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 15, paddingHorizontal: 16, fontSize: 16, fontFamily: "NunitoSans_400Regular", color: "#111827" },
  botao: { backgroundColor: "#111827", height: 52, borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 8 },
  botaoDisabled: { opacity: 0.7 },
  botaoTexto: { color: "#FFFFFF", fontSize: 16, fontWeight: "600", fontFamily: "NunitoSans_600SemiBold" },
});