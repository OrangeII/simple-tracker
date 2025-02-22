import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { createClient } from "@supabase/supabase-js";
import { createPinia } from "pinia";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

const app = createApp(App);
app.use(createPinia());
app.mount("#app");
