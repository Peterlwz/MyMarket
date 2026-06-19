import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";

import { colors } from "@/theme/colors";

type TabIconProps = {
  color: string;
  focused: boolean;
  name: "home" | "grid" | "add" | "chatbubble-ellipses" | "person";
};

function TabIcon({ color, focused, name }: TabIconProps) {
  const iconName = (focused ? name : `${name}-outline`) as ComponentProps<typeof Ionicons>["name"];

  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons color={color} name={iconName} size={22} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.tabBar
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "首页",
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name="home" />
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "分类",
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name="grid" />
        }}
      />
      <Tabs.Screen
        name="publish"
        options={{
          title: "发布",
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name="add" />
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "消息",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name="chatbubble-ellipses" />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "我的",
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name="person" />
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: "center",
    borderRadius: 8,
    height: 32,
    justifyContent: "center",
    width: 44
  },
  iconWrapActive: {
    backgroundColor: colors.accentSoft
  },
  label: {
    fontSize: 12,
    fontWeight: "700"
  },
  tabBar: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderTopWidth: 1,
    height: 84,
    paddingBottom: 12,
    paddingTop: 8
  }
});
