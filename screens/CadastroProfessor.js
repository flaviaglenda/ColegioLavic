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
  Image
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

      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
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

      const { error: insertError } = await supabase
        .from("professores")
        .insert([{ id: user.id, nome: trimmedNome }]);

      if (insertError) {
        console.log("Erro ao inserir professor:", insertError);
        Alert.alert("Erro", "Não foi possível salvar o professor no banco.");
        return;
      }

      Alert.alert("Sucesso!", "Cadastro realizado! Vá para o login.");

      await supabase.auth.signOut();

      setNome("");
      setEmail("");
      setSenha("");

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
        <Image
          source={require("../src/assets/logo_escola.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>Cadastrar</Text>

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
          style={styles.linkContainer}
          onPress={() => navigation.replace("Login")}
        >
          {" "}
          <Text style={styles.linkText}>
            Já possui conta?<Text style={styles.linkBold}> Entrar</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#c3cdd5ff",
  },
  logo: {
    width: 250,
    height: 250,
    alignSelf: "center",
    marginBottom: -10,
    marginTop: -80,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 50,
    textAlign: "center",
    color: "#20568c",
  },
  input: {
    backgroundColor: "#ecececff",
    marginBottom: 15,
    padding: 15,
    borderRadius: 15,
    fontSize: 16,
    color: "#000",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  button: {
    backgroundColor: "#20568c",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "rgba(17, 69, 80, 1)",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    marginTop: 10,
    width: 200,
    marginLeft: 70,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  linkContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    fontSize: 16,
    color: "#000",
  },
  linkBold: {
    color: "#20568c",
    fontWeight: "bold",
  },
});
