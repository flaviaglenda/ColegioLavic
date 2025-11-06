// Flávia Glenda e Lucas Randal
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,} from "react-native";
import { supabase } from "../supabase";

export default function EditarTurma({ route, navigation }) {
  const { turma } = route.params;

  const [nome, setNome] = useState(turma.nome);
  const [numeroTurma, setNumeroTurma] = useState(String(turma.numero) || "");
  const [loading, setLoading] = useState(false);

  async function salvarAlteracoes() {
    if (!nome.trim() || !numeroTurma.trim()) {
      Alert.alert("Erro", "Nome e número da turma são obrigatórios.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("turmas")
      .update({
        nome: nome,
        numero: Number(numeroTurma),
        updated_at: new Date(),
      })
      .eq("id", turma.id);

    setLoading(false);

    if (error) {
      Alert.alert("Erro", "Falha ao atualizar turma.");
      console.log(error);
      return;
    }

    Alert.alert("Sucesso", "Turma atualizada com sucesso!");
    navigation.navigate("ListarTurmas");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Editar Turma</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome da turma"
        placeholderTextColor="#888"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={styles.input}
        placeholder="Número da turma"
        placeholderTextColor="#888"
        value={numeroTurma}
        onChangeText={setNumeroTurma}
      />

      <TouchableOpacity
        style={styles.botao}
        onPress={salvarAlteracoes}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBotao}>Salvar Alterações</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    padding: 20,
    justifyContent: "center",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  botao: {
    backgroundColor: "#20568c",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  textoBotao: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
