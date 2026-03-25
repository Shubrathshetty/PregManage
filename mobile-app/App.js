import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';

// Import Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import RegistrationScreen from './src/screens/RegistrationScreen';
import QuestionnaireScreen from './src/screens/QuestionnaireScreen';

const Stack = createStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4C8BF5', // PregManage Blue
    accent: '#FF7F50',
    background: '#F8FAFC',
  },
  roundness: 12,
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            headerStyle: { backgroundColor: '#4C8BF5' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
            headerTitleAlign: 'center',
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen} 
            options={{ title: 'Admin Dashboard' }}
          />
          <Stack.Screen 
            name="Registration" 
            component={RegistrationScreen} 
            options={{ title: 'New Registration' }}
          />
          <Stack.Screen 
            name="Questionnaire" 
            component={QuestionnaireScreen} 
            options={{ title: 'Self-Screening' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
