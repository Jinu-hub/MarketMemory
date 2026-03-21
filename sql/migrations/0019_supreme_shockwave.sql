-- numeric → jsonb は自動キャスト不可。既存の数値は JSON の数値として保持する
ALTER TABLE "item_contents" ALTER COLUMN "confidence" SET DATA TYPE jsonb USING (to_jsonb("confidence"));
