import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { colors } from '../theme/colors';

// Screens
import { FarmerDashboardScreen } from '../screens/farmer/FarmerDashboardScreen';
import { FarmerTaskListScreen } from '../screens/farmer/FarmerTaskListScreen';
import { FarmerLogActivityScreen } from '../screens/farmer/FarmerLogActivityScreen';
import { FarmerHarvestScreen } from '../screens/farmer/FarmerHarvestScreen';
import { FarmerCompensationScreen } from '../screens/farmer/FarmerCompensationScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.primary }}>
      <Stack.Screen name="FarmerHome" component={FarmerDashboardScreen} options={{ title: 'Farmer Field Command' }} />
      <Stack.Screen name="FarmerLogActivity" component={FarmerLogActivityScreen} options={{ title: 'Log Field Operation' }} />
      <Stack.Screen name="FarmerHarvest" component={FarmerHarvestScreen} options={{ title: 'Weigh Harvest' }} />
      <Stack.Screen name="FarmerTasks" component={FarmerTaskListScreen} options={{ title: 'Operational Tasks' }} />
      <Stack.Screen name="FarmerCompensation" component={FarmerCompensationScreen} options={{ title: 'Compensation Ledger' }} />
    </Stack.Navigator>
  );
}

export const FarmerNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let icon = '🧑‍🌾';
          if (route.name === 'FarmerDashTab') icon = '📊';
          else if (route.name === 'TasksTab') icon = '📋';
          else if (route.name === 'LogTab') icon = '📝';
          else if (route.name === 'HarvestTab') icon = '⚖️';
          else if (route.name === 'EarningsTab') icon = '💰';
          return <Text style={{ fontSize: 18 }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen name="FarmerDashTab" component={DashboardStack} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="TasksTab" component={FarmerTaskListScreen} options={{ title: 'Tasks' }} />
      <Tab.Screen name="LogTab" component={FarmerLogActivityScreen} options={{ title: 'Log Work' }} />
      <Tab.Screen name="HarvestTab" component={FarmerHarvestScreen} options={{ title: 'Harvest' }} />
      <Tab.Screen name="EarningsTab" component={FarmerCompensationScreen} options={{ title: 'Earnings' }} />
    </Tab.Navigator>
  );
};
