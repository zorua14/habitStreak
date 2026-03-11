import { supabase } from "../lib/supabase"

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.log(error)
    throw error
  }

  return data
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.log(error)
    throw error
  }

  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}