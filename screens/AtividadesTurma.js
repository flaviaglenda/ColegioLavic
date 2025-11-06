import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { supabase } from "../supabase";

export default function AtividadesTurma({ route, navigation }) {
  const turmaId = route?.params?.turmaId;
  const turmaNome = route?.params?.turmaNome;

  const [professor, setProfessor] = useState(null);
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [novaAtividade, setNovaAtividade] = useState({
    titulo: "",
    descricao: "",
  });

  useEffect(() => {
    if (!turmaId) {
      Alert.alert("Erro", "Turma não informada!");
      navigation.goBack();
      return;
    }

    (async () => {
      try {
        const { data: turmaData, error: turmaError } = await supabase
          .from("turmas")
          .select("*, professores (nome)")
          .eq("id", turmaId)
          .single();

        if (turmaError || !turmaData) {
          Alert.alert("Erro", "Não foi possível carregar a turma!");
          return;
        }

        setProfessor(turmaData.professores);

        const { data: atividadesData, error: atividadesError } = await supabase
          .from("atividades")
          .select("*")
          .eq("turma_id", turmaId)
          .order("numero", { ascending: true });

        if (atividadesError) {
          Alert.alert("Erro", "Não foi possível carregar as atividades.");
        } else {
          setAtividades(atividadesData || []);
        }
      } catch (err) {
        console.log(err);
        Alert.alert("Erro", "Algo deu errado ao carregar os dados.");
      } finally {
        setLoading(false);
      }
    })();
  }, [turmaId]);

  const confirmarLogout = () => {
    Alert.alert(
      "Sair da conta",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, sair",
          style: "destructive",
          onPress: () => realizarLogout(), // chama a função de logout real
        },
      ],
      { cancelable: true }
    );
  };
const realizarLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Reseta a navegação completamente e volta pro login
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  } catch (error) {
    console.log("Erro ao sair:", error);
    Alert.alert("Erro", "Não foi possível sair da conta.");
  }
};


  const abrirModal = () => {
    setNovaAtividade({ titulo: "", descricao: "" });
    setModalVisible(true);
  };

  const salvarAtividade = async () => {
    if (!novaAtividade.titulo || !novaAtividade.descricao) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    try {
      const proximoNumero = atividades.length + 1;

      const { data, error } = await supabase
        .from("atividades")
        .insert([
          {
            turma_id: turmaId,
            numero: proximoNumero,
            titulo: novaAtividade.titulo,
            descricao: novaAtividade.descricao,
          },
        ])
        .select();

      if (error) {
        console.log(error);
        Alert.alert("Erro", "Não foi possível cadastrar a atividade.");
        return;
      }

      setAtividades((prev) => [...prev, data[0]]);
      setModalVisible(false);
    } catch (err) {
      console.log(err);
      Alert.alert("Erro", "Falha ao salvar atividade.");
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.profNome}>
          {professor?.nome ? `Prof. ${professor.nome}` : "Professor"}
        </Text>

      </View>

      <Text style={styles.turmaTitulo}>{turmaNome}</Text>

      <TouchableOpacity style={styles.cadastrarBtn} onPress={abrirModal}>
        <Text style={styles.cadastrarText}>Cadastrar Atividade</Text>
      </TouchableOpacity>

      {atividades.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          Nenhuma atividade cadastrada ainda.
        </Text>
      ) : (
        atividades.map((atividade) => (
          <View key={atividade.id} style={styles.card}>
            <Text style={styles.numero}>Atividade #{atividade.numero}</Text>
            <Text style={styles.titulo}>{atividade.titulo}</Text>
            <Text style={styles.descricao}>{atividade.descricao}</Text>
          </View>
        ))
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cadastrar Atividade</Text>
            <TextInput
              placeholder="Título da atividade"
              value={novaAtividade.titulo}
              onChangeText={(text) =>
                setNovaAtividade({ ...novaAtividade, titulo: text })
              }
              style={styles.input}
            />
            <TextInput
              placeholder="Descrição"
              value={novaAtividade.descricao}
              onChangeText={(text) =>
                setNovaAtividade({ ...novaAtividade, descricao: text })
              }
              style={[styles.input, { height: 80 }]}
              multiline
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.saveBtn} onPress={salvarAtividade}>
                <Text style={styles.saveText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef3f9",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  profNome: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a3c6e",
    letterSpacing: 0.5,
  },
  turmaTitulo: {
    fontSize: 34,
    fontWeight: "800",
    color: "#102542",
    marginBottom: 30,
    marginTop: 10,
    textAlign: "center",
    letterSpacing: 0.8,
    textShadowColor: "rgba(0, 0, 0, 0.37)",
    textShadowOffset: { width: 3, height: 1 },
    textShadowRadius: 3,
  },
  cadastrarBtn: {
    backgroundColor: "#3568d4",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#3568d4",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  cadastrarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 17,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderLeftWidth: 5,
    borderLeftColor: "#3568d4",
  },
  numero: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#3568d4",
    marginBottom: 5,
  },
  titulo: {
    fontSize: 18,
    marginTop: 3,
    fontWeight: "700",
    color: "#1c1c1c",
  },
  descricao: {
    fontSize: 15,
    color: "#555",
    marginTop: 8,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    marginHorizontal: 25,
    borderRadius: 20,
    padding: 25,
    width: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1a3c6e",
  },
  input: {
    borderWidth: 1.2,
    borderColor: "#ccd6eb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#f8faff",
    fontSize: 15,
    color: "#333",
  },
  modalBtns: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  saveBtn: {
    backgroundColor: "#1a3c6e",
    flex: 1,
    marginRight: 6,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#1a3c6e",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.4,
  },
  cancelBtn: {
    backgroundColor: "#9ba5b5",
    flex: 1,
    marginLeft: 6,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.4,
  },
});
