/**
 * Change Password API Endpoint
 *
 * This file implements an API endpoint for changing a user's password.
 * It handles form validation, password matching, authentication checks,
 * and password update requests to the Supabase Auth API.
 *
 * Key features:
 * - Request method validation (POST only)
 * - Authentication protection
 * - Password validation with Zod schema
 * - Password confirmation matching
 * - Integration with Supabase Auth API for password updates
 * - Detailed error handling for validation and API errors
 */

import type { Route } from "./+types/change-password";

import { data } from "react-router";

import {
  createPasswordWithConfirmSchema,
  getPasswordValidationMessages,
} from "~/features/auth/lib/password-schema";
import { requireAuthentication, requireMethod } from "~/core/lib/guards.server";
import i18next from "~/core/lib/i18next.server";
import makeServerClient from "~/core/lib/supa-client.server";

/**
 * Action handler for processing password change requests
 *
 * This function handles the complete password change flow:
 * 1. Validates that the request method is POST
 * 2. Authenticates the user making the request
 * 3. Validates the new password format and confirmation match
 * 4. Submits the password change request to Supabase Auth API
 * 5. Returns appropriate success or error responses
 *
 * Security considerations:
 * - Requires POST method to prevent unintended changes
 * - Requires authentication to protect user data
 * - Validates password length and confirmation match
 * - Returns field-specific validation errors
 * - Handles API errors gracefully with appropriate status codes
 *
 * @param request - The incoming HTTP request with form data
 * @returns Response indicating success or error with appropriate details
 */
export async function action({ request }: Route.ActionArgs) {
  requireMethod("POST")(request);

  const t = await i18next.getFixedT(request);
  const changePasswordSchema = createPasswordWithConfirmSchema(
    getPasswordValidationMessages(t),
  );

  const [client] = makeServerClient(request);

  await requireAuthentication(client);

  const formData = await request.formData();
  const {
    success,
    data: validData,
    error,
  } = changePasswordSchema.safeParse(Object.fromEntries(formData));

  if (!success) {
    return data({ fieldErrors: error.flatten().fieldErrors }, { status: 400 });
  }

  const { error: updateError } = await client.auth.updateUser({
    password: validData.password,
  });

  if (updateError) {
    return data({ error: updateError.message }, { status: 400 });
  }

  return {
    success: true,
  };
}
