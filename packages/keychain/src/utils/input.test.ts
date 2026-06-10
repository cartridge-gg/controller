import { describe, it, expect } from "vitest";
import { isValidEmailAddress, isValidPhoneNumber } from "./input";

describe("isValidPhoneNumber", () => {
  describe("valid E.164 numbers", () => {
    it.each([
      "+1234567",
      "+12025550123",
      "+447911123456",
      "+551199998888",
      "+819012345678",
      "+123456789012345",
    ])("accepts %s", (phone) => {
      expect(isValidPhoneNumber(phone)).toBe(true);
    });
  });

  describe("invalid phone numbers", () => {
    it.each([
      "",
      "1234567890",
      "+",
      "+0123456789",
      "+123456",
      "+1234567890123456",
      "+1 234 567 890",
      "+1-234-567-890",
      "+1(234)5678901",
      "++12345678901",
      "+12345abc890",
      " +12345678901",
      "+12345678901 ",
    ])("rejects %s", (phone) => {
      expect(isValidPhoneNumber(phone)).toBe(false);
    });
  });
});

describe("isValidEmailAddress", () => {
  describe("valid emails", () => {
    it.each([
      "user@example.com",
      "first.last@example.com",
      "user+tag@example.com",
      "user_name@example.com",
      "user-name@example.com",
      "user%percent@example.com",
      "123@example.com",
      "user@sub.example.com",
      "user@sub1.sub2.example.com",
      "user@sub1.sub2.sub3.sub4.example.com",
      "user@example.co.uk",
      "USER@EXAMPLE.COM",
      "a@b.cd",
    ])("accepts %s", (email) => {
      expect(isValidEmailAddress(email)).toBe(true);
    });
  });

  describe("invalid emails", () => {
    it.each([
      "",
      "plainaddress",
      "@example.com",
      "user@",
      "user@@example.com",
      "user@example",
      "user@.com",
      "user@example.c",
      "user @example.com",
      "user@exa mple.com",
      "user@example.com ",
      " user@example.com",
      "user@example.com.",
    ])("rejects %s", (email) => {
      expect(isValidEmailAddress(email)).toBe(false);
    });
  });
});
