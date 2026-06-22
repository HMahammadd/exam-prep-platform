import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://odnpetpjbfjwkuasghrt.supabase.co";
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_ERWeLqRBe80MWJbwWpZkMg_iLEXon5z";

export function createClient() {
  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}

export const supabase = createClient();
