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
      <Drawer.Navigator
        screenOptions={{
          headerShown: true, 
        }}
      >
        <Drawer.Screen name="Login" component={RealizarLogin} />
        <Drawer.Screen name="Cadastrar turma" component={CadastrarTurma} />
        <Drawer.Screen name="Turmas" component={ListarTurmas} />
        <Drawer.Screen
          name="Gerenciamento professor"
          component={TelaProfessor}
        />
        <Drawer.Screen name="Atividades Turma" component={AtividadesTurma} />
         <Drawer.Screen name="Cadastro" component={RealizarCadastro} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
