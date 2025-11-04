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
  ActivityIndicator,
} from "react-native";
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

    try {
      setLoading(true);

      // faz o login no Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          Alert.alert("Erro", "E-mail ou senha incorretos!");
        } else if (error.message.includes("Email not confirmed")) {
          Alert.alert("Erro", "Confirme seu e-mail antes de entrar!");
        } else {
          Alert.alert("Erro ao logar", error.message);
        }
        return;
      }

      const user = data?.user;
      if (!user) {
        Alert.alert("Erro", "Usuário não encontrado!");
        return;
      }

      // pega info do professor associado ao user_id
      const { data: profData, error: profError } = await supabase
        .from("professores")
        .select("id, nome")
        .eq("user_id", user.id)
        .single();

      if (profError || !profData) {
        console.log("Erro professor:", profError);
        Alert.alert("Erro", "Professor não encontrado no banco!");
        return;
      }

      // sucesso → navega pra tela principal
      navigation.navigate("TelaPrincipalProfessor", {
        userId: user.id,
        professorId: profData.id,
        nome: profData.nome,
      });
    } catch (err) {
      console.log("Erro de login:", err);
      Alert.alert("Erro ao logar", err.message);
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
        <Text style={styles.title}>Login do Professor</Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
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
            Não tem conta? <Text style={{ color: "#20568c" }}>Cadastre-se</Text>
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
  linkContainer: {
    marginTop: 15,
    alignItems: "center",
  },
  linkText: {
    fontSize: 15,
    color: "#333",
  },
});
