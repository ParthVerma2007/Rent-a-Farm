import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { colors } from '../theme/colors';

// Screens
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminRequestsScreen } from '../screens/admin/AdminRequestsScreen';
import { AdminSharedLandScreen } from '../screens/admin/AdminSharedLandScreen';
import { FarmDiscoveryScreen } from '../screens/customer/FarmDiscoveryScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function OverviewStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.primary }}>
      <Stack.Screen name="AdminOverviewMain" component={AdminDashboardScreen} options={{ title: 'Ecosystem Control' }} />
      <Stack.Screen name="AdminRequests" component={AdminRequestsScreen} options={{ title: 'Feasibility & Assignment' }} />
      <Stack.Screen name="AdminSharedLand" component={AdminSharedLandScreen} options={{ title: 'Shared-Land Optimizer' }} />
    </Stack.Navigator>
  );
}

export const AdminNavigator: React.FC = () => {
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
          let icon = '🛡️';
          if (route.name === 'OverviewTab') icon = '📊';
          else if (route.name === 'RequestsTab') icon = '⚖️';
          else if (route.name === 'OptimizerTab') icon = '🧩';
          else if (route.name === 'FarmsTab') icon = '🏡';
          return <Text style={{ fontSize: 18 }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen name="OverviewTab" component={OverviewStack} options={{ title: 'Overview' }} />
      <Tab.Screen name="RequestsTab" component={AdminRequestsScreen} options={{ title: 'Approvals' }} />
      <Tab.Screen name="OptimizerTab" component={AdminSharedLandScreen} options={{ title: 'Land Optimizer' }} />
      <Tab.Screen name="FarmsTab" component={FarmDiscoveryScreen} options={{ title: 'Farms' }} />
    </Tab.Navigator>
  );
};
