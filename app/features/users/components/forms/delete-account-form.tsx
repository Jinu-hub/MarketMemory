import type { Route } from "@rr/app/features/users/api/+types/delete-account";

import { AlertTriangle, Trash2 } from "lucide-react";
import { useFetcher } from "react-router";

import FormErrors from "~/core/components/form-error";
import {
  NexButton,
  NexCard,
  NexCardContent,
  NexCardFooter,
  NexCardHeader,
  NexCardTitle,
} from "~/core/components/nex";
import { Checkbox } from "~/core/components/ui/checkbox";
import { Label } from "~/core/components/ui/label";

export default function DeleteAccountForm() {
  const fetcher = useFetcher<Route.ComponentProps["actionData"]>();

  return (
    <fetcher.Form
      method="delete"
      className="w-full max-w-screen-md"
      action="/api/users"
    >
      <NexCard
        variant="elevated"
        padding="lg"
        className="w-full border-red-500/40 bg-red-50/30 dark:border-red-500/50 dark:bg-red-950/20"
      >
        <NexCardHeader>
          <div className="flex items-center gap-3">
            <div
              className="rounded-full border border-red-500/30 bg-red-100 p-3 dark:bg-red-950/80"
              aria-hidden="true"
            >
              <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />
            </div>
            <NexCardTitle className="text-red-900 dark:text-red-100">
              Danger zone
            </NexCardTitle>
          </div>
        </NexCardHeader>

        <NexCardContent>
          <div className="flex flex-col gap-4">
            <div className="rounded-r-lg border-l-4 border-red-500 bg-red-100/80 px-4 py-3 dark:bg-red-950/50">
              <p className="text-sm leading-relaxed text-red-950 dark:text-red-50">
                This action cannot be undone. Deleting your account will
                permanently delete all your data.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 rounded-lg border border-red-500/35 p-4 dark:border-red-500/45">
                <Checkbox
                  id="confirm-delete"
                  name="confirm-delete"
                  required
                  className="mt-0.5 border-red-500/60 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600 dark:border-red-400/60 dark:data-[state=checked]:border-red-500 dark:data-[state=checked]:bg-red-500"
                />
                <Label
                  htmlFor="confirm-delete"
                  className="cursor-pointer font-medium leading-snug text-foreground"
                >
                  I confirm that I want to delete my account.
                </Label>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-red-500/35 p-4 dark:border-red-500/45">
                <Checkbox
                  id="confirm-irreversible"
                  name="confirm-irreversible"
                  required
                  className="mt-0.5 border-red-500/60 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600 dark:border-red-400/60 dark:data-[state=checked]:border-red-500 dark:data-[state=checked]:bg-red-500"
                />
                <Label
                  htmlFor="confirm-irreversible"
                  className="cursor-pointer font-medium leading-snug text-foreground"
                >
                  I understand that this action is irreversible.
                </Label>
              </div>
            </div>
          </div>
        </NexCardContent>

        <NexCardFooter className="flex flex-col gap-4 border-t-0 pt-2">
          <NexButton
            type="submit"
            variant="primary"
            size="lg"
            loading={fetcher.state === "submitting"}
            disabled={fetcher.state === "submitting"}
            leftIcon={<Trash2 className="size-4" />}
            className="w-full border border-red-500/25 bg-red-800/90 font-semibold text-red-50 hover:bg-red-800 dark:border-red-500/30 dark:bg-red-950/75 dark:hover:bg-red-900/85"
          >
            Delete account
          </NexButton>
          {fetcher.data?.error ? (
            <FormErrors errors={[fetcher.data.error]} />
          ) : null}
        </NexCardFooter>
      </NexCard>
    </fetcher.Form>
  );
}
