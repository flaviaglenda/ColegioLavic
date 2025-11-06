// Flávia Glenda e Lucas Randal
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../supabase';

export default function CadastrarTurma({ navigation }) {
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [numeroTurma, setNumeroTurma] = useState('');

  const handleCadastrar = async () => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'O nome da turma é obrigatório.');
      return;
    }

    if (!numeroTurma.trim()) {
      Alert.alert('Erro', 'O número da turma é obrigatório.');
      return;
    }

    if (!nome.trim() || !numeroTurma.trim()) {
      Alert.alert('Erro', 'O nome e o número da turma são obrigatórios.');
      return;
    }

    setLoading(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        Alert.alert('Erro', 'Não foi possível identificar o professor logado.');
        setLoading(false);
        return;
      }

      const professorId = userData.user.id;

      const { error } = await supabase.from('turmas').insert([
        {
          nome,
          numero: numeroTurma,
          professor_id: professorId,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);

      if (error) {
        console.error('Erro ao cadastrar turma:', error);
        Alert.alert('Erro', 'Não foi possível cadastrar a turma.');
      } else {
        Alert.alert('Sucesso', 'Turma cadastrada com sucesso!');
        setNome('');
        setNumeroTurma('');
        navigation.navigate('TelaProfessor');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Erro inesperado', 'Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Cadastrar Turma</Text>

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
        onPress={handleCadastrar}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBotao}>Cadastrar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    padding: 20,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  botao: {
    backgroundColor: '#20568c',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  textoBotao: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
