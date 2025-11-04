import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { supabase } from './supabase'; 

import RealizarLogin from './screens/RealizarLogin';
import RealizarCadastro from './screens/CadastroProfessor';
import CadastrarTurma from './screens/CadastrarTurma';
import ListarTurmas from './screens/ListarTurmas';
import TelaProfessor from './screens/TelaProfessor';
import AtividadesTurma from './screens/AtividadesTurma';

const Drawer = createDrawerNavigator();

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };
    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return null; 

  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName={session ? 'Gerenciamento professor' : 'Login'}
        screenOptions={{ headerShown: true }}
      >
        {!session ? (
          <>
            <Drawer.Screen
              name="Login"
              component={RealizarLogin}
              options={{ title: 'Realizar Login' }}
            />
            <Drawer.Screen
              name="Cadastro"
              component={RealizarCadastro}
              options={{ title: 'Cadastro de Professor' }}
            />
          </>
        ) : (
          <>
            <Drawer.Screen
              name="Gerenciamento professor"
              component={TelaProfessor}
              options={{ title: 'Tela do Professor' }}
            />
            <Drawer.Screen
              name="Cadastrar turma"
              component={CadastrarTurma}
              options={{ title: 'Cadastrar Turma' }}
            />
            <Drawer.Screen
              name="Turmas"
              component={ListarTurmas}
              options={{ title: 'Listar Turmas' }}
            />
            <Drawer.Screen
              name="Atividades Turma"
              component={AtividadesTurma}
              options={{ title: 'Atividades da Turma' }}
            />
          </>
        )}
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
