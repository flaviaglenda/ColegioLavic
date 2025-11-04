import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../supabase";

export default function CadastroProfessor({ navigation }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    const trimmedNome = nome.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedSenha = senha.trim();

    if (!trimmedNome || !trimmedEmail || !trimmedSenha) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      Alert.alert("Erro", "Digite um e‑mail válido!");
      return;
    }

    if (trimmedSenha.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setLoading(true);

      // 1) Cria usuário no Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedSenha,
      });

      if (signUpError) {
        console.log("Erro ao cadastrar no Auth:", signUpError);
        Alert.alert(
          "Erro no cadastro",
          signUpError.message.includes("registered")
            ? "Esse e‑mail já está cadastrado!"
            : signUpError.message
        );
        return;
      }

      const user = signUpData?.user;
      if (!user) {
        Alert.alert("Erro", "Usuário não foi criado corretamente.");
        return;
      }

      // 2) Insere dados extras na tabela “professores”
      const { error: insertError } = await supabase
        .from("professores")
        .insert([{ user_id: user.id, nome: trimmedNome }]);

      if (insertError) {
        console.log("Erro ao inserir professor:", insertError);
        Alert.alert("Erro", "Não foi possível salvar o professor no banco.");
        return;
      }

      // Feedback pro usuário
      Alert.alert("Sucesso!", "Cadastro realizado! Vá para o login.");

      // Logout imediato pra não criar sessão automática
      await supabase.auth.signOut();

      // Limpa campos
      setNome("");
      setEmail("");
      setSenha("");

      // Navega para Login
      navigation.replace("Login");
    } catch (err) {
      console.log("Erro inesperado:", err);
      Alert.alert("Erro", "Algo deu errado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Cadastrar Professor</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          style={styles.input}
          placeholder="E‑mail"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha (mínimo 6 caracteres)"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.link}
          onPress={() => navigation.replace("Login")}
        >
          <Text style={{ color: "#20568c" }}>Já tem conta? Entrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#20568c",
  },
  input: {
    backgroundColor: "#f2f2f2",
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#20568c",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    marginTop: 15,
    alignItems: "center",
  },
});
