import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import RealizarLogin from './screens/RealizarLogin';
import CadastrarTurma from './screens/CadastrarTurma';
import ListarTurma from './screens/ListarTurma';
import TelaProfessor from './screens/TelaProfessor';

const Drawer = createDrawerNavigator();
function DrawerNavigator() {
return (
<NavigationContainer>
<Drawer.Navigator>
<Drawer.Screen name="Login" component={RealizarLogin} />
<Drawer.Screen name="Cadastrar turma" component={CadastrarTurma} />
<Drawer.Screen name="Turmas" component={ListarTurma} />
<Drawer.Screen name="Gerenciamento professor" component={TelaProfessor} />
<Drawer.Screen name="Atividades turmas" component={AtividadesTurma} />
</Drawer.Navigator>
</NavigationContainer>
);
}