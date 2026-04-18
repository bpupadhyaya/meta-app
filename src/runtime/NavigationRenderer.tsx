import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationDefinition, ScreenDefinition, ActionDefinition } from '../schema/types';
import { ScreenRenderer } from './ScreenRenderer';
import { useTheme } from './styling/ThemeProvider';
import { StorageEngine } from './storage/StorageEngine';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

interface NavigationRendererProps {
  navigation: NavigationDefinition;
  screens: ScreenDefinition[];
  actions: Record<string, ActionDefinition>;
  storage?: StorageEngine;
}

export function NavigationRenderer({ navigation: navDef, screens, actions, storage }: NavigationRendererProps) {
  const theme = useTheme();

  const screenMap = new Map(screens.map((s) => [s.name, s]));

  const screenOptions = {
    headerStyle: { backgroundColor: theme.colors.surface },
    headerTintColor: theme.colors.text,
    contentStyle: { backgroundColor: theme.colors.background },
  };

  const tabBarOptions = {
    tabBarActiveTintColor: theme.colors.primary,
    tabBarInactiveTintColor: theme.colors.textSecondary,
    tabBarStyle: { backgroundColor: theme.colors.surface },
  };

  if (navDef.type === 'tabs') {
    return (
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName={navDef.initialScreen}
          screenOptions={tabBarOptions}
        >
          {navDef.items.map((item) => {
            const screenDef = screenMap.get(item.screen);
            if (!screenDef) return null;
            return (
              <Tab.Screen
                key={item.screen}
                name={item.screen}
                options={{
                  title: item.label ?? screenDef.title,
                  ...screenOptions,
                }}
              >
                {({ navigation }) => (
                  <ScreenRenderer
                    screen={screenDef}
                    actions={actions}
                    storage={storage}
                    navigation={{
                      navigate: (screen, params) => navigation.navigate(screen, params),
                      goBack: () => navigation.goBack(),
                    }}
                  />
                )}
              </Tab.Screen>
            );
          })}
        </Tab.Navigator>
      </NavigationContainer>
    );
  }

  // Default: stack navigation
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={navDef.initialScreen}
        screenOptions={screenOptions}
      >
        {navDef.items.map((item) => {
          const screenDef = screenMap.get(item.screen);
          if (!screenDef) return null;
          return (
            <Stack.Screen
              key={item.screen}
              name={item.screen}
              options={{
                title: item.label ?? screenDef.title,
              }}
            >
              {({ navigation }) => (
                <ScreenRenderer
                  screen={screenDef}
                  actions={actions}
                  storage={storage}
                  navigation={{
                    navigate: (screen, params) => navigation.navigate(screen, params),
                    goBack: () => navigation.goBack(),
                  }}
                />
              )}
            </Stack.Screen>
          );
        })}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
