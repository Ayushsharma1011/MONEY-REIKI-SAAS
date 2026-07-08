"use client";

import type { Provider } from "@supabase/supabase-js";
import { env } from "@/config/env";
import type {
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  SignupInput
} from "@/features/auth/schemas";
import { getFriendlyAuthError } from "@/features/auth/messages";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const LOGIN_REDIRECT = "/dashboard";
const RESET_REDIRECT = "/reset-password";
const VERIFY_REDIRECT = "/verify-email";

export async function signInWithEmail(input: LoginInput) {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: getFriendlyAuthError(error) };
  }
}

export async function signUpWithEmail(input: SignupInput) {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}${VERIFY_REDIRECT}`,
        data: {
          full_name: input.fullName,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      }
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: getFriendlyAuthError(error) };
  }
}

export async function signInWithOAuth(provider: Provider = "google") {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback?next=${LOGIN_REDIRECT}`
      }
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: getFriendlyAuthError(error) };
  }
}

export async function sendPasswordReset(input: ForgotPasswordInput) {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.resetPasswordForEmail(
      input.email,
      {
        redirectTo: `${env.NEXT_PUBLIC_APP_URL}${RESET_REDIRECT}`
      }
    );

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: getFriendlyAuthError(error) };
  }
}

export async function updatePassword(input: ResetPasswordInput) {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.updateUser({
      password: input.password
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: getFriendlyAuthError(error) };
  }
}

export async function resendVerificationEmail(email: string) {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}${VERIFY_REDIRECT}`
      }
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: getFriendlyAuthError(error) };
  }
}

export async function signOut() {
  try {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    return { error: getFriendlyAuthError(error) };
  }
}
