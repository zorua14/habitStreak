import { supabase } from "../lib/supabase";
import { habitsApi } from "../redux/api/habitsApi";
import { persistor, store } from "../redux/store";


export async function signOut() {

  // 1. Sign out from Supabase
  await supabase.auth.signOut();

  // 2. Reset the RTK Query cache so no stale data lingers in memory
  store.dispatch(habitsApi.util.resetApiState());
  
  // 3. Purge redux-persist so AsyncStorage is wiped for the next user
  await persistor.purge();

}