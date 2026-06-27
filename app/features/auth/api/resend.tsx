/**
 * Email Verification Resend API Endpoint
 */
import type { Route } from "./+types/resend";

import { data } from "react-router";
import { z } from "zod";

import i18next from "~/core/lib/i18next.server";
import makeServerClient from "~/core/lib/supa-client.server";

export async function action({ request }: Route.ActionArgs) {
  const t = await i18next.getFixedT(request);
  const resendSchema = z.object({
    email: z.string().email({ message: t("auth.validation.invalidEmail") }),
  });

  const formData = await request.formData();

  const { success, data: validData } = resendSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!success) {
    return data({ error: t("auth.validation.invalidEmail") }, { status: 400 });
  }

  const [client] = makeServerClient(request);

  const { error } = await client.auth.resend({
    type: "signup",
    email: validData.email,
    options: {
      emailRedirectTo: `${process.env.SITE_URL}/auth/verify`,
    },
  });

  if (error) {
    return data({ error: error.message }, { status: 400 });
  }

  return data({ success: true }, { status: 200 });
}
