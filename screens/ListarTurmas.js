import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
import { supabase } from "../supabase";
import { useNavigation } from "@react-navigation/native";

export default function ListarTurmas() {
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  async function carregarTurmas() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert("Erro", "Usuário não autenticado.");
      navigation.navigate("RealizarLogin");
      return;
    }

    const { data: prof, error: erroProf } = await supabase
      .from("professores")
      .select("id, nome")
      .eq("id", user.id)
      .single();

    if (erroProf || !prof) {
      Alert.alert("Erro", "Professor não encontrado.");
      return;
    }

    const { data: turmasData, error: erroTurmas } = await supabase
      .from("turmas")
      .select("id, nome, numero, created_at")
      .eq("professor_id", prof.id)
      .order("created_at", { ascending: false });

    if (erroTurmas) {
      Alert.alert("Erro ao carregar turmas", erroTurmas.message);
    } else {
      setTurmas(turmasData || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", carregarTurmas);
    return unsubscribe;
  }, [navigation]);

  async function excluirTurma(idTurma) {
    Alert.alert("Confirmação", "Tem certeza que deseja excluir esta turma?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        onPress: async () => {
          const { count, error: erroCount } = await supabase
            .from("atividades")
            .select("*", { count: "exact", head: true })
            .eq("turma_id", idTurma);

          if (erroCount) {
            Alert.alert("Erro", "Falha ao verificar atividades.");
            return;
          }

          if (count > 0) {
            Alert.alert(
              "Aviso",
              "Você não pode excluir uma turma com atividades cadastradas."
            );
            return;
          }

          const { error: erroDel } = await supabase
            .from("turmas")
            .delete()
            .eq("id", idTurma);

          if (erroDel) {
            Alert.alert("Erro", "Não foi possível excluir a turma.");
          } else {
            Alert.alert("Sucesso", "Turma excluída com sucesso!");
            carregarTurmas();
          }
        },
      },
    ]);
  }

  function visualizarAtividades(turma) {
    navigation.navigate("AtividadesTurma", {
      turmaId: turma.id,
      turmaNome: turma.nome,
      turmaNumero: turma.numero,
      turmaCreatedAt: turma.created_at,
    });
  }

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#f5f5f5" }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 15 }}>
        Minhas Turmas
      </Text>

      {loading ? (
        <Text>Carregando...</Text>
      ) : turmas.length === 0 ? (
        <Text>Nenhuma turma cadastrada.</Text>
      ) : (
        <FlatList
          data={turmas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: "#fff",
                padding: 15,
                borderRadius: 10,
                marginBottom: 10,
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "500" }}>
                Nome da turma:
              </Text>
              <Text style={{ fontSize: 16, marginBottom: 5 }}>{item.nome}</Text>
              <Text style={{ fontSize: 18, fontWeight: "500"}}>
                Nº:
              </Text>
              <Text style={{ fontSize: 16, marginBottom: 5 }}>{item.numero}</Text>
              <Text style={{ fontSize: 18, fontWeight: "500" }}>
                Criado em:
              </Text>
              <Text style={{ fontSize: 16, marginBottom: 5 }}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 10,
                }}
              >
                <TouchableOpacity
                  onPress={() => visualizarAtividades(item)}
                  style={{
                    backgroundColor: "#007bff",
                    padding: 8,
                    borderRadius: 5,
                  }}
                >
                  <Text style={{ color: "#fff" }}>Visualizar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("EditarTurma", { turma: item })
                  }
                  style={{
                    backgroundColor: "#ffc107",
                    padding: 8,
                    borderRadius: 5,
                  }}
                >
                  <Text style={{ color: "#000" }}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => excluirTurma(item.id)}
                  style={{
                    backgroundColor: "#dc3545",
                    padding: 8,
                    borderRadius: 5,
                  }}
                >
                  <Text style={{ color: "#fff" }}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <View style={{ marginTop: 20 }}>
        <Button
          title="Cadastrar Nova Turma"
          onPress={() => navigation.navigate("CadastrarTurma")}
        />
      </View>
    </View>
  );
}
