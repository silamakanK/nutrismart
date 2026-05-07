import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { getAvatarBucketName, getAvatarPublicUrl } from "./avatar";

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterAll(() => {
  process.env = originalEnv;
});

describe("getAvatarPublicUrl", () => {
  it("returns null when no key is provided", () => {
    expect(getAvatarPublicUrl()).toBeNull();
  });

  it("returns a URL built from NEXT_PUBLIC_SUPABASE_URL", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co/";
    const url = getAvatarPublicUrl("user/avatar.png");

    expect(url).toBe(
      "https://example.supabase.co/storage/v1/object/public/avatars/user/avatar.png"
    );
  });

  it("falls back to SUPABASE_URL when the public env is missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.SUPABASE_URL = "https://example.supabase.co";

    const url = getAvatarPublicUrl("key.jpg");
    expect(url).toBe(
      "https://example.supabase.co/storage/v1/object/public/avatars/key.jpg"
    );
  });

  it("logs a warning and returns null when no Supabase URL is set", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_URL;

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(getAvatarPublicUrl("missing.png")).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      "SUPABASE_URL is not defined. Cannot build avatar URL."
    );
    warnSpy.mockRestore();
  });
});

describe("getAvatarBucketName", () => {
  it("exposes the avatars bucket name", () => {
    expect(getAvatarBucketName()).toBe("avatars");
  });
});
