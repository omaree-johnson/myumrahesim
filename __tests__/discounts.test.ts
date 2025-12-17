import { applyPercentDiscountWithFloor } from "@/lib/discounts";

describe("discounts", () => {
  it("applies percent discount normally", () => {
    const calc = applyPercentDiscountWithFloor({ totalCents: 2000, percentOff: 5, minTotalCents: 0 });
    expect(calc.discountAmountCents).toBe(100);
    expect(calc.discountedTotalCents).toBe(1900);
  });

  it("clamps discount so total never drops below floor", () => {
    const calc = applyPercentDiscountWithFloor({ totalCents: 2000, percentOff: 10, minTotalCents: 1950 });
    // desired 200; allowed 50
    expect(calc.discountAmountCents).toBe(50);
    expect(calc.discountedTotalCents).toBe(1950);
  });

  it("does not apply discount if floor exceeds total", () => {
    const calc = applyPercentDiscountWithFloor({ totalCents: 1000, percentOff: 50, minTotalCents: 1200 });
    expect(calc.discountAmountCents).toBe(0);
    expect(calc.discountedTotalCents).toBe(1000);
  });
});

