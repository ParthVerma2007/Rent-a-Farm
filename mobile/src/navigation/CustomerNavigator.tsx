import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { colors } from '../theme/colors';

// Screens
import { CustomerHomeScreen } from '../screens/customer/CustomerHomeScreen';
import { FarmDiscoveryScreen } from '../screens/customer/FarmDiscoveryScreen';
import { FarmDetailScreen } from '../screens/customer/FarmDetailScreen';
import { BuildBriefScreen } from '../screens/customer/BuildBriefScreen';
import { FeasibilityScreen } from '../screens/customer/FeasibilityScreen';
import { CustomerProjectDetailScreen } from '../screens/customer/CustomerProjectDetailScreen';
import { HarvestReconciliationScreen } from '../screens/customer/HarvestReconciliationScreen';
import { FeedbackScreen } from '../screens/customer/FeedbackScreen';
import { NotificationsScreen } from '../screens/customer/NotificationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.primary, headerBackTitle: 'Back' }}>
      <Stack.Screen name="HomeMain" component={CustomerHomeScreen} options={{ title: 'Rent-a-Farm' }} />
      <Stack.Screen name="FarmDetail" component={FarmDetailScreen} options={{ title: 'Farm Estate & Plots' }} />
      <Stack.Screen name="BuildBrief" component={BuildBriefScreen} options={{ title: 'Custom Farming Brief' }} />
      <Stack.Screen name="Feasibility" component={FeasibilityScreen} options={{ title: 'Agronomic Assessment' }} />
      <Stack.Screen name="ProjectDetail" component={CustomerProjectDetailScreen} options={{ title: 'Project Tracker' }} />
      <Stack.Screen name="HarvestReconciliation" component={HarvestReconciliationScreen} options={{ title: 'Harvest Reconciliation' }} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ title: 'Freshness Feedback' }} />
    </Stack.Navigator>
  );
}

function ExploreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.primary }}>
      <Stack.Screen name="ExploreMain" component={FarmDiscoveryScreen} options={{ title: 'Explore Organic Farms' }} />
      <Stack.Screen name="FarmDetail" component={FarmDetailScreen} options={{ title: 'Farm & Plots' }} />
      <Stack.Screen name="BuildBrief" component={BuildBriefScreen} options={{ title: 'Custom Farming Brief' }} />
      <Stack.Screen name="Feasibility" component={FeasibilityScreen} options={{ title: 'Feasibility Report' }} />
    </Stack.Navigator>
  );
}

function ProjectsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.primary }}>
      <Stack.Screen name="ProjectDetailMain" component={CustomerProjectDetailScreen} options={{ title: 'Cultivation Lifecycle' }} />
      <Stack.Screen name="HarvestReconciliation" component={HarvestReconciliationScreen} options={{ title: 'Harvest Reconciliation' }} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ title: 'Customer Feedback' }} />
    </Stack.Navigator>
  );
}

export const CustomerNavigator: React.FC = () => {
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
          let icon = '🏡';
          if (route.name === 'HomeTab') icon = '🌾';
          else if (route.name === 'ExploreTab') icon = '🗺️';
          else if (route.name === 'ProjectsTab') icon = '🌱';
          else if (route.name === 'NotifTab') icon = '🔔';
          return <Text style={{ fontSize: 18 }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Home' }} />
      <Tab.Screen name="ExploreTab" component={ExploreStack} options={{ title: 'Explore Farms' }} />
      <Tab.Screen name="ProjectsTab" component={ProjectsStack} options={{ title: 'My Farm' }} />
      <Tab.Screen name="NotifTab" component={NotificationsScreen} options={{ title: 'Updates' }} />
    </Tab.Navigator>
  );
};
