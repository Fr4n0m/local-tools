import { describe, expect, it } from "vitest";

import {
  clampTimerInput,
  secondsToClock,
} from "@/modules/custom-timer/domain/timer";

describe("timer domain", () => {
  it("clamps seconds", () => {
    expect(clampTimerInput(-1)).toBe(0);
    expect(clampTimerInput(2)).toBe(2);
  });

  it("formats clock", () => {
    expect(secondsToClock(0)).toBe("00:00:00");
    expect(secondsToClock(3661)).toBe("01:01:01");
  });
});
