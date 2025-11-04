import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

import RealizarLogin from './screens/RealizarLogin';
import RealizarCadastro from './screens/CadastroProfessor';
import CadastrarTurma from './screens/CadastrarTurma';
import ListarTurmas from './screens/ListarTurmas';
import TelaProfessor from './screens/TelaProfessor';
import AtividadesTurma from './screens/AtividadesTurma';

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Login" screenOptions={{headerShown: true, }}>
        <Drawer.Screen name="Login" component={RealizarLogin} options={{ title: 'Realizar Login' }}/>
        <Drawer.Screen name="Cadastro" component={RealizarCadastro} options={{ title: 'Cadastro de Professor' }}/>
        <Drawer.Screen name="Cadastrar turma" component={CadastrarTurma} options={{ title: 'Cadastrar Turma' }}/>
        <Drawer.Screen name="Turmas" component={ListarTurmas} options={{ title: 'Listar Turmas' }}/>
        <Drawer.Screen name="Gerenciamento professor" component={TelaProfessor} options={{ title: 'Tela do Professor' }}/>
        <Drawer.Screen name="Atividades Turma" component={AtividadesTurma} options={{ title: 'Atividades da Turma' }}/>
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
