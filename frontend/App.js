// App.js — Root component. Just mounts the navigator.
// Keeping this file thin is intentional; all logic lives in the navigator
// and screen components, making the app easier to test.

import React from "react";
import { StatusBar } from "expo-status-bar";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <AppNavigator />
    </>
  );
}
