import all from "./configs/all";
import recommended from "./configs/recommended";

import elementClassNameUse from "./rules/element-class-name-use";
import parentLevelClassUse from "./rules/parent-level-class-use";

export const rules = {
  "element-class-name-use": elementClassNameUse,
  "parent-level-class-use": parentLevelClassUse,
};

export const configs = {
  all,
  recommended,
};
