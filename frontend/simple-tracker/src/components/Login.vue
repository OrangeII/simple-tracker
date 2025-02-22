<template>
  <div>
    <div>
      <h1>Login</h1>
      <button @click="signInWithGitHub">Sign in with GitHub</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { supabase } from "../main.js";

const signInWithGitHub = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "github",
  });

  if (error) console.error("Error signing in:", error.message);
};
</script>
