import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator, StyleSheet, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "./supabase";

import RealizarLogin from "./screens/RealizarLogin";
import RealizarCadastro from "./screens/CadastroProfessor";
import CadastrarTurma from "./screens/CadastrarTurma";
import TelaProfessor from "./screens/ListarTurmas";
import AtividadesTurma from "./screens/AtividadesTurma";
import EditarTurma from "./screens/EditarTurma";

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const PRIMARY_COLOR = "#20568c";
const ACCENT_COLOR = "#e2c20bff";
const BACKGROUND_COLOR = "#20568c";
const TEXT_COLOR = "#eae8e8ff";
const HEADER_BACKGROUND = "#20568c";

function CustomDrawer(props) {
  const [professorNome, setProfessorNome] = useState("");

  useEffect(() => {
    const buscarProfessor = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("professores")
          .select("nome")
          .eq("id", user.id)
          .single();

        if (!error && data) setProfessorNome(data.nome);
      }
    };
    buscarProfessor();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <DrawerContentScrollView {...props} style={drawerStyles.drawerContainer}>
      <View style={drawerStyles.headerContainer}>
        <Text style={drawerStyles.professorNome}>
          {professorNome || "Carregando..."}
        </Text>
      </View>

      <DrawerItemList {...props} />

      <View style={drawerStyles.logoutItem}>
        <DrawerItem
          label="Sair"
          onPress={handleLogout}
          labelStyle={drawerStyles.logoutLabel}
          icon={({ size }) => (
            <Ionicons name="log-out-outline" size={size} color="#ef3636ff" />
          )}
        />
      </View>
    </DrawerContentScrollView>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={RealizarLogin} />
      <Stack.Screen name="Cadastro" component={RealizarCadastro} />
    </Stack.Navigator>
  );
}

function AppDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="TelaProfessor"
      screenOptions={{
        ...drawerNavigatorOptions,
        headerShown: true,
        headerTitleAlign: "center",
        headerTintColor: "#ffffffff", 
        headerStyle: drawerStyles.screenHeader,
        headerTitle: () => (
          <Image
            source={require("./src/assets/logo_escola_adaptada.png")}
            style={{
              width: 190,
              height: 250,
              resizeMode: "contain",
            }}
          />
        ),
      }}
      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      <Drawer.Screen
        name="TelaProfessor"
        component={TelaProfessor}
        options={{
          drawerLabel: "Tela do Professor",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="CadastrarTurma"
        component={CadastrarTurma}
        options={{
          drawerLabel: "Cadastrar Turma",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="AtividadesTurma"
        component={AtividadesTurma}
        options={{
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="EditarTurma"
        component={EditarTurma}
        options={{
          headerShown: true,
          drawerItemStyle: { display: "none" },
        }}
      />
    </Drawer.Navigator>
  );
}

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

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!session ? <AuthStack /> : <AppDrawer />}
    </NavigationContainer>
  );
}

const drawerStyles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  headerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    borderBottomColor: "#ffffff33",
    borderBottomWidth: 1,
  },
  professorNome: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },
  logoutItem: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#ffffff33",
    paddingTop: 10,
    marginHorizontal: 10,
  },
  logoutLabel: {
    color: "#f12e2eff",
    fontWeight: "bold",
    fontSize: 16,
  },
  screenHeader: {
    backgroundColor: HEADER_BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
});

const drawerNavigatorOptions = {
  drawerStyle: {
    width: 280,
    backgroundColor: BACKGROUND_COLOR,
  },
  drawerActiveTintColor: ACCENT_COLOR,
  drawerInactiveTintColor: TEXT_COLOR,
  drawerActiveBackgroundColor: "#ffffff22",
  drawerItemStyle: {
    marginVertical: 4,
    borderRadius: 12,
    marginHorizontal: 10,
  },
  labelStyle: {
    fontSize: 16,
    fontWeight: "500",
  },
};
