import { cx } from "../src/index";

describe("classNames", () => {
  it("should compose class names", () => {
    const expected = "cx-1 cx-2 cx-3 cx-4";
    const actual = cx(
      "cx-1",
      "cx-2",
      cx("cx-3", true && "cx-4", false && "cx-5")
    );
    expect(actual).toEqual(expected);
  });
});
