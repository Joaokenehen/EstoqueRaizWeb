import React from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  ArrowRight,
  ArrowRightLeft,
  BarChart3,
  CheckCircle2,
  MapPin,
  Package,
  ShieldCheck,
  Users,
} from "lucide-react-native";
import { RootStackParamList } from "../types/navigation";
import { useAppFonts } from "../hooks/useAppFonts";

const { width } = Dimensions.get("window");
const logoEstoque = require("../assets/images/LogoEstoqueRaiz.png");

const stats = [
  {
    value: "7",
    label: "unidades",
    description: "Visao de operacao distribuida.",
  },
  {
    value: "ABC",
    label: "relatorios",
    description: "Curva e indicadores sempre por perto.",
  },
  {
    value: "RBAC",
    label: "acessos",
    description: "Cada papel com a responsabilidade certa.",
  },
  {
    value: "24h",
    label: "mobilidade",
    description: "Painel e app no mesmo ecossistema.",
  },
];

const modules = [
  {
    icon: Package,
    title: "Produtos e aprovacoes",
    description:
      "Cadastre itens, acompanhe pendencias e avance o fluxo com mais clareza.",
  },
  {
    icon: ArrowRightLeft,
    title: "Movimentacoes rastreaveis",
    description:
      "Entradas, saidas, ajustes e transferencias com contexto operacional.",
  },
  {
    icon: MapPin,
    title: "Unidades organizadas",
    description:
      "Visualize filiais, depositos e acessos sem perder consistencia.",
  },
  {
    icon: Users,
    title: "Equipe com permissoes",
    description:
      "Gerente, financeiro e estoquista trabalhando na mesma base.",
  },
];

const flowSteps = [
  {
    title: "Cadastre ou acesse a conta",
    description:
      "O onboarding segue o fluxo de aprovacao do sistema para evitar acessos soltos.",
  },
  {
    title: "Execute a operacao no celular",
    description:
      "Consulte produtos, acompanhe movimentos e resolva aprovacoes sem depender do escritorio.",
  },
  {
    title: "Leia os indicadores",
    description:
      "Curva ABC, estoque baixo e status da operacao ficam mais proximos da decisao.",
  },
];

const proofItems = [
  "Fluxo alinhado com a API principal",
  "Aprovacoes, cadastros e consultas no mesmo circuito",
  "Mobilidade para acompanhar a operacao em campo",
];

export default function LandingPage() {
  type NavProp = NativeStackNavigationProp<RootStackParamList, "LandingPage">;
  const navigation = useNavigation<NavProp>();
  const fontsLoaded = useAppFonts();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0E3" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <LinearGradient
          colors={["#F5F0E3", "#FCFAF4", "#FFFFFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroGlowPrimary} />
          <View style={styles.heroGlowSecondary} />

          <View style={styles.heroBadge}>
            <ShieldCheck color="#2D5A27" size={16} />
            <Text style={styles.heroBadgeText}>
              Operacao organizada do cadastro ao relatorio
            </Text>
          </View>

          <View style={styles.logoCard}>
            <Image source={logoEstoque} style={styles.logo} resizeMode="contain" />
          </View>

          <Text style={styles.heroTitle}>
            Seu estoque com cara de sistema profissional, nao de improviso.
          </Text>

          <Text style={styles.heroSubtitle}>
            O app do Estoque Raiz aproxima a operacao do time com uma experiencia
            mais clara, mais confiante e mais alinhada com a plataforma web.
          </Text>

          <View style={styles.statsGrid}>
            {stats.map((item) => (
              <View key={item.label} style={styles.statCard}>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
                <Text style={styles.statDescription}>{item.description}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Cadastro")}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryButtonText}>Criar conta agora</Text>
            <ArrowRight color="#FFFFFF" size={18} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.9}
          >
            <Text style={styles.secondaryButtonText}>Entrar no sistema</Text>
          </TouchableOpacity>

          <View style={styles.proofList}>
            {proofItems.map((item) => (
              <View key={item} style={styles.proofItem}>
                <CheckCircle2 color="#2D5A27" size={16} />
                <Text style={styles.proofItemText}>{item}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>O app na operacao</Text>
          <Text style={styles.sectionTitle}>
            Mobilidade para operar sem perder contexto.
          </Text>
          <Text style={styles.sectionDescription}>
            Do cadastro ao acompanhamento de indicadores, o app aproxima a
            rotina do estoque e mantem a equipe conectada ao que precisa de
            acao.
          </Text>

          <View style={styles.moduleList}>
            {modules.map((item) => (
              <View key={item.title} style={styles.moduleCard}>
                <View style={styles.moduleIconWrap}>
                  <item.icon color="#2D5A27" size={22} strokeWidth={2.1} />
                </View>
                <View style={styles.moduleContent}>
                  <Text style={styles.moduleTitle}>{item.title}</Text>
                  <Text style={styles.moduleDescription}>
                    {item.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <LinearGradient
          colors={["#17351A", "#244B22"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.storyCard}
        >
          <Text style={styles.storyEyebrow}>Fluxo essencial</Text>
          <Text style={styles.storyTitle}>
            O app explica a jornada sem cansar quem acabou de chegar.
          </Text>

          <View style={styles.storySteps}>
            {flowSteps.map((step, index) => (
              <View key={step.title} style={styles.storyStepCard}>
                <View style={styles.storyStepNumber}>
                  <Text style={styles.storyStepNumberText}>
                    {String(index + 1).padStart(2, "0")}
                  </Text>
                </View>
                <View style={styles.storyStepContent}>
                  <Text style={styles.storyStepTitle}>{step.title}</Text>
                  <Text style={styles.storyStepDescription}>
                    {step.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.benefitsSection}>
          <View style={styles.benefitHeader}>
            <View style={styles.benefitHeaderIcon}>
              <BarChart3 color="#2D5A27" size={22} />
            </View>
            <View style={styles.benefitHeaderContent}>
              <Text style={styles.benefitHeaderTitle}>
                Mais clareza para operar, mais confianca para decidir.
              </Text>
              <Text style={styles.benefitHeaderText}>
                O app coloca produtos, aprovacoes e indicadores na mao do time
                para que a operacao continue fluindo mesmo fora da mesa.
              </Text>
            </View>
          </View>

          <View style={styles.benefitChecklist}>
            <View style={styles.checkItem}>
              <CheckCircle2 color="#2D5A27" size={18} />
              <Text style={styles.checkItemText}>
                Consulta rapida de produtos, unidades e estoques
              </Text>
            </View>
            <View style={styles.checkItem}>
              <CheckCircle2 color="#2D5A27" size={18} />
              <Text style={styles.checkItemText}>
                Aprovacoes e fluxos mais claros para o time
              </Text>
            </View>
            <View style={styles.checkItem}>
              <CheckCircle2 color="#2D5A27" size={18} />
              <Text style={styles.checkItemText}>
                Indicadores e contexto operacional mais proximos
              </Text>
            </View>
          </View>
        </View>

        <LinearGradient
          colors={["#F2E7D1", "#FCFAF5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaCard}
        >
          <Text style={styles.ctaEyebrow}>Pronto para entrar</Text>
          <Text style={styles.ctaTitle}>
            Comece com um sistema que organiza a rotina desde o primeiro acesso.
          </Text>
          <Text style={styles.ctaDescription}>
            Crie sua conta, entre na plataforma e leve a operacao para uma
            base mais clara, conectada e pronta para crescer.
          </Text>

          <View style={styles.ctaButtons}>
            <TouchableOpacity
              style={styles.ctaPrimaryButton}
              onPress={() => navigation.navigate("Cadastro")}
              activeOpacity={0.9}
            >
              <Text style={styles.ctaPrimaryButtonText}>Comecar agora</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ctaSecondaryButton}
              onPress={() => navigation.navigate("Login")}
              activeOpacity={0.9}
            >
              <Text style={styles.ctaSecondaryButtonText}>Ja tenho conta</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 Estoque Raiz. Operacao, gestao e mobilidade no mesmo ecossistema.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F3EA",
  },
  scrollContent: {
    paddingBottom: 36,
  },
  hero: {
    margin: 18,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(45, 90, 39, 0.10)",
    shadowColor: "#2D5A27",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 30,
    elevation: 8,
  },
  heroGlowPrimary: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(45, 90, 39, 0.10)",
    top: -60,
    right: -40,
  },
  heroGlowSecondary: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(75, 54, 33, 0.08)",
    bottom: 10,
    left: -60,
  },
  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: "rgba(45, 90, 39, 0.10)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  heroBadgeText: {
    marginLeft: 8,
    color: "#2D5A27",
    fontSize: 12,
    fontFamily: "NunitoSans_600SemiBold",
    letterSpacing: 0.2,
  },
  logoCard: {
    marginTop: 18,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.74)",
    borderWidth: 1,
    borderColor: "rgba(45, 90, 39, 0.08)",
    alignItems: "center",
  },
  logo: {
    width: width * 0.72,
    height: 120,
  },
  heroTitle: {
    marginTop: 20,
    fontSize: 34,
    lineHeight: 40,
    color: "#17351A",
    fontFamily: "NunitoSans_700Bold",
  },
  heroSubtitle: {
    marginTop: 14,
    fontSize: 16,
    lineHeight: 28,
    color: "#5B6470",
    fontFamily: "NunitoSans_400Regular",
  },
  statsGrid: {
    marginTop: 22,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48.2%",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(45, 90, 39, 0.08)",
  },
  statValue: {
    fontSize: 26,
    color: "#2D5A27",
    fontFamily: "NunitoSans_700Bold",
  },
  statLabel: {
    marginTop: 6,
    color: "#4B3621",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontFamily: "NunitoSans_600SemiBold",
  },
  statDescription: {
    marginTop: 8,
    color: "#64748B",
    fontSize: 13,
    lineHeight: 20,
    fontFamily: "NunitoSans_400Regular",
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: "#2D5A27",
    minHeight: 56,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#2D5A27",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "NunitoSans_700Bold",
  },
  secondaryButton: {
    marginTop: 12,
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(45, 90, 39, 0.18)",
    backgroundColor: "rgba(255,255,255,0.82)",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#2D5A27",
    fontSize: 16,
    fontFamily: "NunitoSans_700Bold",
  },
  proofList: {
    marginTop: 18,
  },
  proofItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  proofItemText: {
    marginLeft: 10,
    flex: 1,
    color: "#425466",
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "NunitoSans_400Regular",
  },
  section: {
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  sectionEyebrow: {
    color: "#6A4B2A",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    fontFamily: "NunitoSans_600SemiBold",
  },
  sectionTitle: {
    marginTop: 10,
    color: "#17351A",
    fontSize: 28,
    lineHeight: 34,
    fontFamily: "NunitoSans_700Bold",
  },
  sectionDescription: {
    marginTop: 12,
    color: "#5B6470",
    fontSize: 15,
    lineHeight: 26,
    fontFamily: "NunitoSans_400Regular",
  },
  moduleList: {
    marginTop: 22,
  },
  moduleCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(45, 90, 39, 0.08)",
    shadowColor: "#2D5A27",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  moduleIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F3EBD9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  moduleContent: {
    flex: 1,
  },
  moduleTitle: {
    color: "#17351A",
    fontSize: 17,
    lineHeight: 23,
    fontFamily: "NunitoSans_700Bold",
  },
  moduleDescription: {
    marginTop: 6,
    color: "#64748B",
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "NunitoSans_400Regular",
  },
  storyCard: {
    marginHorizontal: 18,
    marginTop: 18,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    shadowColor: "#17351A",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.24,
    shadowRadius: 28,
    elevation: 7,
  },
  storyEyebrow: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontFamily: "NunitoSans_600SemiBold",
  },
  storyTitle: {
    marginTop: 10,
    color: "#FFFFFF",
    fontSize: 27,
    lineHeight: 34,
    fontFamily: "NunitoSans_700Bold",
  },
  storySteps: {
    marginTop: 18,
  },
  storyStepCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 22,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  storyStepNumber: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  storyStepNumberText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "NunitoSans_700Bold",
  },
  storyStepContent: {
    flex: 1,
  },
  storyStepTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 22,
    fontFamily: "NunitoSans_700Bold",
  },
  storyStepDescription: {
    marginTop: 5,
    color: "rgba(248, 250, 252, 0.84)",
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "NunitoSans_400Regular",
  },
  benefitsSection: {
    marginHorizontal: 18,
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(45, 90, 39, 0.08)",
  },
  benefitHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  benefitHeaderIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#F2EAD7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  benefitHeaderContent: {
    flex: 1,
  },
  benefitHeaderTitle: {
    color: "#17351A",
    fontSize: 20,
    lineHeight: 27,
    fontFamily: "NunitoSans_700Bold",
  },
  benefitHeaderText: {
    marginTop: 8,
    color: "#5B6470",
    fontSize: 14,
    lineHeight: 23,
    fontFamily: "NunitoSans_400Regular",
  },
  benefitChecklist: {
    marginTop: 18,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(100, 116, 139, 0.22)",
  },
  checkItemText: {
    marginLeft: 10,
    flex: 1,
    color: "#334155",
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "NunitoSans_600SemiBold",
  },
  ctaCard: {
    marginHorizontal: 18,
    marginTop: 18,
    borderRadius: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(45, 90, 39, 0.08)",
  },
  ctaEyebrow: {
    color: "#6A4B2A",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontFamily: "NunitoSans_600SemiBold",
  },
  ctaTitle: {
    marginTop: 10,
    color: "#17351A",
    fontSize: 28,
    lineHeight: 34,
    fontFamily: "NunitoSans_700Bold",
  },
  ctaDescription: {
    marginTop: 12,
    color: "#5B6470",
    fontSize: 15,
    lineHeight: 25,
    fontFamily: "NunitoSans_400Regular",
  },
  ctaButtons: {
    marginTop: 20,
  },
  ctaPrimaryButton: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: "#2D5A27",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaPrimaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "NunitoSans_700Bold",
  },
  ctaSecondaryButton: {
    marginTop: 10,
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(45, 90, 39, 0.16)",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaSecondaryButtonText: {
    color: "#2D5A27",
    fontSize: 16,
    fontFamily: "NunitoSans_700Bold",
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 22,
    alignItems: "center",
  },
  footerText: {
    color: "#7C8797",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 22,
    fontFamily: "NunitoSans_400Regular",
  },
});
