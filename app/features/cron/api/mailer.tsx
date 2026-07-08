/**
 * Email Queue Processing API Endpoint
 *
 * Cron-triggered endpoint that processes emails from a Postgres message queue (PGMQ).
 * Pops up to MAILER_BATCH_SIZE messages per run via a single pop_mailer_batch RPC.
 */

import type { Route } from "./+types/mailer";

import * as Sentry from "@sentry/node";
import { data } from "react-router";
import WelcomeEmail from "transactional-emails/emails/welcome-user";

import { normalizeLocale } from "~/core/lib/locale.server";
import resendClient from "~/core/lib/resend-client.server";
import adminClient from "~/core/lib/supa-admin-client.server";

const MAILER_BATCH_SIZE_DEFAULT = 3;
const MAILER_BATCH_SIZE_MAX = 10;

const subjectByLocale = {
  ko: "Market Memory에 오신 것을 환영합니다!",
  en: "Welcome to Market Memory!",
  ja: "Market Memoryへようこそ！",
} as const;

function resolveMailerBatchSize(): number {
  const raw = process.env.MAILER_BATCH_SIZE?.trim();
  if (!raw) {
    return MAILER_BATCH_SIZE_DEFAULT;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return MAILER_BATCH_SIZE_DEFAULT;
  }

  return Math.min(parsed, MAILER_BATCH_SIZE_MAX);
}

function normalizeQueueMessage(message: unknown): Record<string, unknown> | null {
  if (!message || typeof message !== "object") {
    return null;
  }

  if ("message" in message && typeof message.message === "object" && message.message) {
    return message.message as Record<string, unknown>;
  }

  return message as Record<string, unknown>;
}

function parseMailerBatch(data: unknown): unknown[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data;
}

async function processWelcomeEmail(messageData: Record<string, unknown>) {
  const to = messageData.to;
  const emailData = messageData.data;
  const template = messageData.template;

  if (template !== "welcome") {
    return;
  }

  const recipientEmail =
    (typeof to === "string" ? to : null) ??
    (emailData &&
    typeof emailData === "object" &&
    typeof (emailData as { email?: string }).email === "string"
      ? (emailData as { email: string }).email
      : null);

  if (!recipientEmail) {
    console.error("[cron] Welcome email skipped: missing recipient", {
      messageData,
    });
    Sentry.captureMessage("Welcome email skipped: missing recipient", {
      level: "warning",
      extra: { messageData },
    });
    return;
  }

  const rawUserMetaData =
    emailData &&
    typeof emailData === "object" &&
    "raw_user_meta_data" in emailData
      ? (emailData as { raw_user_meta_data?: Record<string, unknown> })
          .raw_user_meta_data
      : undefined;

  const username =
    (typeof rawUserMetaData?.name === "string" ? rawUserMetaData.name : null) ??
    (typeof rawUserMetaData?.full_name === "string"
      ? rawUserMetaData.full_name
      : null) ??
    "user";

  const userId =
    emailData && typeof emailData === "object" && "id" in emailData
      ? (emailData as { id?: string }).id
      : undefined;

  let validLocale: ReturnType<typeof normalizeLocale> = "ko";

  if (userId) {
    const { data: profile } = await adminClient
      .from("profiles")
      .select("locale")
      .eq("profile_id", userId)
      .maybeSingle();

    validLocale = normalizeLocale(profile?.locale);
  }

  if (
    !rawUserMetaData?.name &&
    !rawUserMetaData?.full_name
  ) {
    console.log("[cron] Username not found in raw_user_meta_data, using fallback:", {
      rawUserMetaData,
      email: recipientEmail,
    });
  }

  const { error } = await resendClient.emails.send({
    from: "Market Memory <hello@mail.marketmemory.app>",
    to: [recipientEmail],
    subject: subjectByLocale[validLocale],
    react: WelcomeEmail({
      username,
      locale: validLocale,
    }),
  });

  if (error) {
    Sentry.captureException(
      error instanceof Error ? error : new Error(String(error)),
    );
  }
}

export async function action({ request }: Route.LoaderArgs) {
  if (
    request.method !== "POST" ||
    request.headers.get("Authorization") !== process.env.CRON_SECRET
  ) {
    return data(null, { status: 401 });
  }

  const batchSize = resolveMailerBatchSize();
  const { data: batch, error } = await adminClient.rpc("pop_mailer_batch", {
    batch_size: batchSize,
  });

  if (error) {
    console.error("[cron] PGMQ batch error:", error);
    Sentry.captureException(
      error instanceof Error ? error : new Error(String(error)),
    );
    return data(null, { status: 200 });
  }

  const messages = parseMailerBatch(batch);

  if (messages.length > 0) {
    console.log(
      `[cron] Retrieved ${messages.length} message(s):`,
      JSON.stringify(messages, null, 2),
    );
  }

  for (const message of messages) {
    const messageData = normalizeQueueMessage(message);
    if (!messageData) {
      continue;
    }

    try {
      await processWelcomeEmail(messageData);
    } catch (error) {
      console.error("[cron] Email processing failed:", error);
      Sentry.captureException(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  return data(null, { status: 200 });
}
