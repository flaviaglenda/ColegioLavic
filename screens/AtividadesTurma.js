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
  const [editando, setEditando] = useState(false);
  const [atividadeSelecionada, setAtividadeSelecionada] = useState(null);
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
        await carregarAtividades();
      } catch (err) {
        console.log(err);
        Alert.alert("Erro", "Algo deu errado ao carregar os dados.");
      } finally {
        setLoading(false);
      }
    })();
  }, [turmaId]);

  const carregarAtividades = async () => {
    const { data, error } = await supabase
      .from("atividades")
      .select("*")
      .eq("turma_id", turmaId)
      .order("numero", { ascending: true });

    if (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível carregar as atividades.");
    } else {
      setAtividades(data || []);
    }
  };

  const abrirModal = (atividade = null) => {
    if (atividade) {
      setEditando(true);
      setAtividadeSelecionada(atividade);
      setNovaAtividade({
        titulo: atividade.titulo,
        descricao: atividade.descricao,
      });
    } else {
      setEditando(false);
      setNovaAtividade({ titulo: "", descricao: "" });
    }
    setModalVisible(true);
  };

  const salvarAtividade = async () => {
    if (!novaAtividade.titulo || !novaAtividade.descricao) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    try {
      if (editando && atividadeSelecionada) {
        const { error } = await supabase
          .from("atividades")
          .update({
            titulo: novaAtividade.titulo,
            descricao: novaAtividade.descricao,
          })
          .eq("id", atividadeSelecionada.id);

        if (error) throw error;

        setAtividades((prev) =>
          prev.map((a) =>
            a.id === atividadeSelecionada.id ? { ...a, ...novaAtividade } : a
          )
        );

        Alert.alert("Sucesso", "Atividade atualizada!");
      } else {
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

        if (error) throw error;

        setAtividades((prev) => [...prev, data[0]]);
        Alert.alert("Sucesso", "Atividade cadastrada!");
      }

      setModalVisible(false);
    } catch (err) {
      console.log(err);
      Alert.alert("Erro", "Falha ao salvar atividade.");
    }
  };

  const excluirAtividade = async (atividadeId) => {
    Alert.alert(
      "Excluir atividade",
      "Tem certeza que deseja excluir esta atividade?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Tentando excluir atividade ID:", atividadeId);
              const { data, error } = await supabase
                .from("atividades")
                .delete()
                .eq("id", atividadeId)
                .select();

              console.log("DELETE RESULT:", { data, error });

              if (error) throw error;
              if (!data || data.length === 0) {
                console.warn("Nenhuma linha foi deletada, talvez o ID esteja errado?");
              }

              setAtividades((prev) =>
                prev.filter((a) => a.id !== atividadeId)
              );
              Alert.alert("Sucesso", "Atividade excluída!");
            } catch (err) {
              console.error("Erro ao excluir:", err);
              Alert.alert(
                "Erro",
                "Não foi possível excluir a atividade. Veja o console para detalhes."
              );
            }
          },
        },
      ]
    );
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

      <TouchableOpacity style={styles.cadastrarBtn} onPress={() => abrirModal()}>
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

            <View style={styles.cardBtns}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => abrirModal(atividade)}
              >
                <Text style={styles.btnText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => excluirAtividade(atividade.id)}
              >
                <Text style={styles.btnText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editando ? "Editar Atividade" : "Cadastrar Atividade"}
            </Text>
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
                <Text style={styles.saveText}>
                  {editando ? "Salvar Alterações" : "Salvar"}
                </Text>
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
  },
  turmaTitulo: {
    fontSize: 34,
    fontWeight: "800",
    color: "#102542",
    marginBottom: 30,
    marginTop: 10,
    textAlign: "center",
  },
  cadastrarBtn: {
    backgroundColor: "#20568c",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  cadastrarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 17,
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
    borderLeftColor: "#20568c",
  },
  numero: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#20568c",
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
  cardBtns: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 10,
  },
  editBtn: {
    backgroundColor: "#ffc107",
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 10,
    color: "#000",
  },
  deleteBtn: {
    backgroundColor: "#dc3545",
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
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
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  cancelBtn: {
    backgroundColor: "#9ba5b5",
    flex: 1,
    marginLeft: 6,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
