// Flávia Glenda e Lucas Randal
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Image,} from "react-native";
import { supabase } from "../supabase";

export default function RealizarLogin({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Erro", "E-mail inválido!");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error) {
        Alert.alert(
          "Erro ao logar",
          error.message.includes("Invalid login credentials")
            ? "E-mail ou senha incorretos!"
            : error.message.includes("Email not confirmed")
            ? "Confirme seu e-mail antes de entrar!"
            : error.message
        );
        setLoading(false);
        return;
      }

      const user = data?.user;
      if (!user) {
        Alert.alert("Erro", "Usuário não encontrado!");
        setLoading(false);
        return;
      }

      const { data: profData, error: profError } = await supabase
        .from("professores")
        .select("id, nome")
        .eq("user_id", user.id)
        .single();

      if (profError || !profData) {
        Alert.alert(
          "Erro",
          "Professor não encontrado no banco. Verifique se o cadastro foi feito corretamente!"
        );
        setLoading(false);
        return;
      }

      navigation.navigate("TelaProfessor", {
        userId: user.id,
        professorId: profData.id,
        nome: profData.nome,
      });
    } catch (err) {
      console.log("Erro de login:", err);
      Alert.alert(
        "Erro ao logar",
        err?.message || "Ocorreu um erro inesperado. Verifique sua conexão."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <Image
          source={require("../src/assets/logo_escola.png")}
          style={styles.logo}
        />

        <Text style={styles.title}>Bem-vindo(a)</Text>
        <Text style={styles.subtitle}>Faça login para continuar</Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#888"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#888"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Cadastro")}
          style={styles.linkContainer}
        >
          <Text style={styles.linkText}>
            Não tem conta? <Text style={styles.linkBold}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 5,
    textAlign: "center",
    color: "#20568c",
  },
  subtitle: {
    fontSize: 16,
    color: "#3e3e3eff",
    textAlign: "center",
    marginBottom: 30,
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
    width: 110,
    marginLeft: 120,
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
