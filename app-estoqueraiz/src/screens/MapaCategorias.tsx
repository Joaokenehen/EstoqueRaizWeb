import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
}

export default function MapaCategorias() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [ehGerente, setEhGerente] = useState(false);

  const verificarCargoUsuario = React.useCallback(async () => {
    try {
      const cargo = await AsyncStorage.getItem("cargo");
      setEhGerente(cargo === "gerente");
    } catch (error) {
      console.error("Erro ao verificar cargo do usuário:", error);
      setEhGerente(false);
    }
  }, []);

  const carregarCategorias = React.useCallback(async () => {
    try {
      setCarregando(true);
      const response = await api.get("/api/categorias");
      setCategorias(response.data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível carregar as categorias",
        position: "top",
        visibilityTime: 3000,
      });
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    verificarCargoUsuario();
    carregarCategorias();
  }, [verificarCargoUsuario, carregarCategorias]);

  const categoriasFiltradas = React.useMemo(() => {
    if (!termoPesquisa) return categorias;
    const termoLower = termoPesquisa.toLowerCase();
    return categorias.filter(
      (c) =>
        c.nome.toLowerCase().includes(termoLower) ||
        (c.descricao && c.descricao.toLowerCase().includes(termoLower))
    );
  }, [categorias, termoPesquisa]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerTextos}>
            <Text style={styles.titulo}>Lista de Categorias</Text>
            <View style={styles.subtituloContainer}>
              {carregando && <ActivityIndicator size="small" color="#059669" />}
              <Text style={styles.subtitulo}>
                {carregando
                  ? "Carregando..."
                  : `${categoriasFiltradas.length} categorias encontradas`}
              </Text>
            </View>
          </View>

          {ehGerente && (
            <TouchableOpacity
              style={styles.botaoCadastro}
              onPress={() => navigation.navigate("CadastroCategoria")}
              activeOpacity={0.8}
            >
              <View style={styles.iconeCadastroContainer}>
                <MaterialIcons name="add-circle-outline" size={20} color="#059669" />
              </View>
              <Text style={styles.textoCadastro}>Nova Categoria</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.barraPesquisa}>
        <MaterialIcons name="search" size={20} color="#666" />
        <TextInput
          style={styles.inputPesquisa}
          placeholder="Buscar por nome ou descrição..."
          placeholderTextColor="#999"
          value={termoPesquisa}
          onChangeText={setTermoPesquisa}
        />
        {termoPesquisa.length > 0 && (
          <TouchableOpacity onPress={() => setTermoPesquisa("")}>
            <MaterialIcons name="clear" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {carregando ? (
        <ActivityIndicator
          size="large"
          color="#059669"
          style={styles.loading}
        />
      ) : categoriasFiltradas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="category" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Nenhuma categoria encontrada.</Text>
        </View>
      ) : (
        <ScrollView style={styles.lista}>
          {categoriasFiltradas.map((categoria) => (
            <View key={categoria.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="local-offer" size={24} color="#059669" />
                <Text style={styles.cardTitulo}>{categoria.nome}</Text>
              </View>
              {categoria.descricao ? (
                <Text style={styles.cardDescricao}>{categoria.descricao}</Text>
              ) : (
                <Text style={styles.cardDescricaoVazia}>Sem descrição</Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  botaoVoltar: { marginRight: 16 },
  headerTextos: { flex: 1 },
  titulo: { fontSize: 20, fontWeight: "bold", color: "#333" },
  subtituloContainer: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  subtitulo: { fontSize: 14, color: "#666", marginLeft: 8 },
  botaoCadastro: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0fdf4",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  iconeCadastroContainer: { marginBottom: 2 },
  textoCadastro: { fontSize: 10, fontFamily: "NunitoSans_600SemiBold", color: "#059669", fontWeight: "600" },
  barraPesquisa: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  inputPesquisa: { flex: 1, fontSize: 15, color: "#050505", marginLeft: 12 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { alignItems: "center", padding: 40 },
  emptyText: { fontSize: 16, color: "#666", marginTop: 16 },
  lista: { flex: 1, padding: 16 },
  card: { backgroundColor: "#f8f9fa", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#e9ecef" },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  cardTitulo: { fontSize: 18, fontWeight: "bold", color: "#333", marginLeft: 8, flex: 1 },
  cardDescricao: { fontSize: 14, color: "#666", marginBottom: 4, marginLeft: 32 },
  cardDescricaoVazia: { fontSize: 14, color: "#999", fontStyle: "italic", marginLeft: 32 },
});