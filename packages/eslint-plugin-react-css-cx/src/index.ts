import all from "./configs/all";
import recommended from "./configs/recommended";

import elementClassNameUse from "./rules/element-class-name-use";
import parentLevelClassUse from "./rules/parent-level-class-use";

export const rules = [elementClassNameUse, parentLevelClassUse];

export const configs = {
  all,
  recommended,
};
