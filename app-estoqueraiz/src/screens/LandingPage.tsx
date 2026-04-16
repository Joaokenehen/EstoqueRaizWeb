import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { ArrowRight, CheckCircle2, Package, BarChart3, MapPin, Users } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const logoEstoque = require('../assets/images/LogoEstoqueRaiz.png');

export default function LandingPage() {
  type NavProp = NativeStackNavigationProp<RootStackParamList, 'LandingPage'>;
  const navigation = useNavigation<NavProp>();

  const features = [
    { icon: Package, title: 'Produtos', desc: 'Gestão completa de itens.' },
    { icon: BarChart3, title: 'Relatórios', desc: 'Análise de curva ABC.' },
    { icon: MapPin, title: 'Unidades', desc: 'Múltiplos depósitos.' },
    { icon: Users, title: 'Equipe', desc: 'Controle de acesso.' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Image 
            source={logoEstoque} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>
            Controle seu Estoque com <Text style={styles.highlight}>Inteligência</Text>
          </Text>
          <Text style={styles.subtitle}>
            A solução completa para gerenciar suas operações de onde estiver.
          </Text>

          <TouchableOpacity 
            style={styles.mainButton}
            onPress={() => navigation.navigate('Cadastro')}
          >
            <Text style={styles.mainButtonText}>Começar Agora</Text>
            <ArrowRight color="#FFF" size={20} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryButtonText}>Acessar Conta</Text>
          </TouchableOpacity>
        </View>

        {/* Features Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Funcionalidades</Text>
          <View style={styles.featuresGrid}>
            {features.map((item, index) => (
              <View key={index} style={styles.featureCard}>
                <item.icon color="#044001" size={24} />
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 EstoqueRaiz</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  hero: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FDFCF9',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logo: {
    width: width * 0.7, 
    height: 180,        
    marginBottom: 10,   
    alignSelf: 'center' 
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#044001',
    lineHeight: 40,
  },
  highlight: { color: '#5C4033' },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  mainButton: {
    backgroundColor: '#044001',
    width: '100%',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  mainButtonText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  secondaryButton: {
    marginTop: 12,
    width: '100%',
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#044001',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#044001', fontSize: 18, fontWeight: '600' },
  section: { padding: 24 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold', color: '#044001', marginBottom: 20, textAlign: 'center' },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  featureCard: {
    width: (width - 64) / 2,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderTopWidth: 4,
    borderTopColor: '#044001',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  featureTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 8, color: '#044001' },
  featureDesc: { fontSize: 12, color: '#64748b', marginTop: 4 },
  footer: { padding: 40, alignItems: 'center', borderTopWidth: 1, borderColor: '#eee' },
  footerText: { color: '#94a3b8' },
});