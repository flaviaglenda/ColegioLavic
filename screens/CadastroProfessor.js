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
} from "react-native";
import { supabase } from "../supabase";

export default function CadastroProfessor({ navigation }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!nome || !email || !senha) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    if (!email.includes("@") || senha.length < 6) {
      Alert.alert("Erro", "Digite um e-mail válido e uma senha com pelo menos 6 caracteres.");
      return;
    }

    try {
      setLoading(true);

      // cria o usuário no auth.users
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
      });

      if (error) throw error;

      const userId = data?.user?.id;

      if (!userId) {
        Alert.alert("Erro", "Não foi possível criar o usuário.");
        return;
      }

      // insere os dados do professor na tabela professores
      const { error: insertError } = await supabase
        .from("professores")
        .insert([{ user_id: userId, nome }]);

      if (insertError) throw insertError;

      Alert.alert(
        "Sucesso",
        "Conta criada com sucesso! Agora é só fazer login 😄"
      );
      navigation.navigate("Login");
    } catch (err) {
      Alert.alert("Erro ao cadastrar", err.message);
      console.log("Erro Supabase:", err);
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
          placeholder="E-mail"
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
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.link}
          onPress={() => navigation.navigate("Login")}
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
  },
  button: {
    backgroundColor: "#20568c",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
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
