import { type Route } from "@rr/app/features/users/api/+types/edit-profile";
import { Check, ImageIcon, UserIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";

import FormErrors from "~/core/components/form-error";
import FormSuccess from "~/core/components/form-success";
import {
  NexButton,
  NexCard,
  NexCardContent,
  NexCardDescription,
  NexCardFooter,
  NexCardHeader,
  NexCardTitle,
  NexInput,
} from "~/core/components/nex";
import { Checkbox } from "~/core/components/ui/checkbox";
import { Label } from "~/core/components/ui/label";

export default function EditProfileForm({
  name,
  avatarUrl,
  marketingConsent,
  locale,
}: {
  name: string;
  marketingConsent: boolean;
  avatarUrl: string | null;
  locale: string;
}) {
  const { t, i18n } = useTranslation();
  const fetcher = useFetcher<Route.ComponentProps["actionData"]>();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (fetcher.data && "success" in fetcher.data && fetcher.data.success) {
      formRef.current?.blur();
      formRef.current?.querySelectorAll("input").forEach((input) => {
        input.blur();
      });
      if ("locale" in fetcher.data && typeof fetcher.data.locale === "string") {
        void i18n.changeLanguage(fetcher.data.locale);
      }
    }
  }, [fetcher.data, i18n]);

  const [avatar, setAvatar] = useState<string | null>(avatarUrl);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const onChangeAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
      setSelectedFileName(file.name);
    }
  };

  const nameError =
    fetcher.data &&
    "fieldErrors" in fetcher.data &&
    fetcher.data.fieldErrors?.name
      ? fetcher.data.fieldErrors.name[0]
      : undefined;

  const marketingConsentError =
    fetcher.data &&
    "fieldErrors" in fetcher.data &&
    fetcher.data.fieldErrors?.marketingConsent
      ? fetcher.data.fieldErrors.marketingConsent
      : undefined;

  const localeError =
    fetcher.data &&
    "fieldErrors" in fetcher.data &&
    fetcher.data.fieldErrors?.locale
      ? fetcher.data.fieldErrors.locale
      : undefined;

  return (
    <fetcher.Form
      method="post"
      className="w-full max-w-screen-md"
      encType="multipart/form-data"
      ref={formRef}
      action="/api/users/profile"
    >
      <NexCard variant="elevated" padding="lg" className="w-full">
        <NexCardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-3 shadow-lg">
              <UserIcon className="size-5 text-white" />
            </div>
            <div>
              <NexCardTitle>{t("account.profile.title")}</NexCardTitle>
              <NexCardDescription>
                {t("account.profile.description")}
              </NexCardDescription>
            </div>
          </div>
        </NexCardHeader>

        <NexCardContent>
          <div className="flex flex-col gap-6">
            {/* Avatar upload */}
            <div className="flex flex-col items-center gap-6 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 sm:flex-row dark:border-indigo-800/50 dark:from-indigo-900/40 dark:to-purple-900/40">
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <div className="flex size-28 items-center justify-center overflow-hidden rounded-full bg-indigo-100 ring-2 ring-indigo-400 dark:bg-indigo-900/60 dark:ring-indigo-500">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={t("account.profile.avatarAlt")}
                        className="size-full object-cover"
                      />
                    ) : (
                      <UserIcon className="size-12 text-indigo-400 dark:text-indigo-300" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 shadow-md transition-transform hover:scale-105"
                    aria-label={t("account.profile.uploadAvatarAriaLabel")}
                  >
                    <ImageIcon className="size-4 text-white" />
                  </button>
                </div>
                <span className="text-sm text-indigo-500 dark:text-indigo-300">
                  {t("account.profile.avatar")}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Check className="size-4 shrink-0 text-emerald-500" />
                    {t("account.profile.maxSize")}
                  </span>
                  <span className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Check className="size-4 shrink-0 text-emerald-500" />
                    {t("account.profile.allowedFormats")}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <NexButton
                    type="button"
                    variant="gradient"
                    size="md"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold text-white shadow-md hover:from-indigo-700 hover:to-purple-700"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t("account.profile.selectFile")}
                  </NexButton>
                  <span className="text-muted-foreground text-sm">
                    {selectedFileName ?? t("account.profile.noFileSelected")}
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  id="avatar"
                  name="avatar"
                  type="file"
                  accept="image/png,image/jpeg,image/gif"
                  className="sr-only"
                  onChange={onChangeAvatar}
                />
              </div>
            </div>

            {/* Name */}
            <NexInput
              label={t("account.profile.nameLabel")}
              id="name"
              name="name"
              required
              type="text"
              placeholder={t("account.profile.namePlaceholder")}
              defaultValue={name}
              leftIcon={<UserIcon className="size-4" />}
              error={nameError}
            />

            {/* Default locale */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="locale" className="font-medium">
                {t("account.profile.defaultLocaleLabel")}
              </Label>
              <select
                id="locale"
                name="locale"
                defaultValue={locale}
                className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="ko">{t("navigation.kr")}</option>
                <option value="ja">{t("navigation.ja")}</option>
                <option value="en">{t("navigation.en")}</option>
              </select>
              <p className="text-muted-foreground text-sm">
                {t("account.profile.defaultLocaleDescription")}
              </p>
              {localeError ? <FormErrors errors={localeError} /> : null}
            </div>

            {/* Marketing consent */}
            <div className="bg-muted/30 flex items-center gap-3 rounded-xl border-2 border-dashed border-border p-4">
              <Checkbox
                id="marketingConsent"
                name="marketingConsent"
                defaultChecked={marketingConsent}
              />
              <Label
                htmlFor="marketingConsent"
                className="cursor-pointer font-medium"
              >
                {t("account.profile.marketingConsent")}
              </Label>
            </div>
            {marketingConsentError ? (
              <FormErrors errors={marketingConsentError} />
            ) : null}
          </div>
        </NexCardContent>

        <NexCardFooter className="flex flex-col gap-4 border-t-0 pt-2">
          <NexButton
            type="submit"
            variant="primary"
            size="lg"
            loading={fetcher.state === "submitting"}
            className="w-full font-semibold"
          >
            {t("account.profile.saveProfile")}
          </NexButton>
          {fetcher.data && "success" in fetcher.data && fetcher.data.success ? (
            <FormSuccess message={t("account.profile.profileUpdated")} />
          ) : null}
          {fetcher.data && "error" in fetcher.data && fetcher.data.error ? (
            <FormErrors errors={[fetcher.data.error]} />
          ) : null}
        </NexCardFooter>
      </NexCard>
    </fetcher.Form>
  );
}
