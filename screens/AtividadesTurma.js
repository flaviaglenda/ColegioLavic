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

export default function AtividadesTurma({ navigation }) {
  const [professor, setProfessor] = useState(null);
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [novaAtividade, setNovaAtividade] = useState({ titulo: "", descricao: "", turmaId: "" });

  // Carrega professor e turmas
  useEffect(() => {
    (async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          Alert.alert("Erro", "Usuário não encontrado!");
          setLoading(false);
          return;
        }

        const userId = user.id;

        const { data: profData, error: profError } = await supabase
          .from("professores")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (profError || !profData) {
          Alert.alert("Erro", "Professor não encontrado!");
          setLoading(false);
          return;
        }

        setProfessor(profData);

        // Carrega turmas
        const { data: turmasData, error: turmasError } = await supabase
          .from("turmas")
          .select("*")
          .eq("professor_id", profData.id);

        if (turmasError) {
          Alert.alert("Erro", "Não foi possível carregar as turmas.");
          setLoading(false);
          return;
        }

        // Carrega atividades de cada turma
        const turmasComAtividades = await Promise.all(
          turmasData.map(async (turma) => {
            const { data: atividadesData } = await supabase
              .from("atividades")
              .select("*")
              .eq("turma_id", turma.id)
              .order("numero", { ascending: true });

            return { ...turma, atividades: atividadesData || [] };
          })
        );

        setTurmas(turmasComAtividades);
      } catch (err) {
        console.log(err);
        Alert.alert("Erro", "Algo deu errado.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.replace("Login");
  };

  const abrirModal = (turmaId) => {
    setNovaAtividade({ titulo: "", descricao: "", turmaId });
    setModalVisible(true);
  };

  const salvarAtividade = async () => {
    if (!novaAtividade.titulo || !novaAtividade.descricao) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    try {
      const turma = turmas.find((t) => t.id === novaAtividade.turmaId);
      const proximoNumero = turma.atividades.length + 1;

      const { data, error } = await supabase.from("atividades").insert([
        {
          turma_id: novaAtividade.turmaId,
          numero: proximoNumero,
          titulo: novaAtividade.titulo,
          descricao: novaAtividade.descricao,
        },
      ]);

      if (error) {
        console.log(error);
        Alert.alert("Erro", "Não foi possível cadastrar a atividade.");
        return;
      }

      // Atualiza a lista local
      setTurmas((prev) =>
        prev.map((t) =>
          t.id === novaAtividade.turmaId
            ? { ...t, atividades: [...t.atividades, data[0]] }
            : t
        )
      );

      setModalVisible(false);
    } catch (err) {
      console.log(err);
      Alert.alert("Erro", "Algo deu errado ao cadastrar.");
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <View style={styles.header}>
        <Text style={styles.nomeProfessor}>{professor?.nome || "Professor"}</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {turmas.length === 0 && (
        <Text style={{ textAlign: "center", marginTop: 20 }}>Nenhuma turma cadastrada.</Text>
      )}

      {turmas.map((turma) => (
        <View key={turma.id} style={styles.turmaContainer}>
          <Text style={styles.turmaNome}>{turma.nome}</Text>

          <TouchableOpacity style={styles.cadastrarBtn} onPress={() => abrirModal(turma.id)}>
            <Text style={styles.cadastrarText}>Cadastrar Atividade</Text>
          </TouchableOpacity>

          {turma.atividades.length === 0 && (
            <Text style={{ marginBottom: 15 }}>Nenhuma atividade nessa turma.</Text>
          )}

          {turma.atividades.map((atividade) => (
            <View key={atividade.id} style={styles.atividadeCard}>
              <Text style={styles.numero}>Atividade #{atividade.numero}: {atividade.titulo}</Text>
              <Text style={styles.descricao}>{atividade.descricao}</Text>
            </View>
          ))}
        </View>
      ))}

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cadastrar Atividade</Text>
            <TextInput
              placeholder="Título da Atividade"
              value={novaAtividade.titulo}
              onChangeText={(text) => setNovaAtividade({ ...novaAtividade, titulo: text })}
              style={styles.input}
            />
            <TextInput
              placeholder="Descrição"
              value={novaAtividade.descricao}
              onChangeText={(text) => setNovaAtividade({ ...novaAtividade, descricao: text })}
              style={[styles.input, { height: 80 }]}
              multiline
            />
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TouchableOpacity style={styles.saveBtn} onPress={salvarAtividade}>
                <Text style={styles.saveText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
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
  container: { flex: 1, backgroundColor: "#f1f1f1", padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  nomeProfessor: { fontSize: 20, fontWeight: "bold", color: "#20568c" },
  logoutBtn: { backgroundColor: "#20568c", padding: 8, borderRadius: 10 },
  logoutText: { color: "#fff", fontWeight: "bold" },
  turmaContainer: { marginBottom: 25, padding: 10, backgroundColor: "#ffffff", borderRadius: 15 },
  turmaNome: { fontSize: 18, fontWeight: "bold", color: "#20568c", marginBottom: 10 },
  cadastrarBtn: { backgroundColor: "#3e8ed0", paddingVertical: 8, borderRadius: 12, alignItems: "center", marginBottom: 12 },
  cadastrarText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  atividadeCard: { backgroundColor: "#ecececff", padding: 12, borderRadius: 12, marginBottom: 10 },
  numero: { fontWeight: "bold", marginBottom: 5, color: "#20568c" },
  descricao: { fontSize: 16, color: "#000" },
  modalContainer: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { margin: 20, backgroundColor: "#fff", borderRadius: 15, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 10, marginBottom: 12 },
  saveBtn: { backgroundColor: "#20568c", padding: 10, borderRadius: 10, flex: 1, marginRight: 5, alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "bold" },
  cancelBtn: { backgroundColor: "#888", padding: 10, borderRadius: 10, flex: 1, marginLeft: 5, alignItems: "center" },
  cancelText: { color: "#fff", fontWeight: "bold" },
});
