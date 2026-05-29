import { _warn } from "../globals.js";
import { registerDirective } from "../registry.js";

registerDirective("validate", {
  priority: 30,
  init(el, attrName) {
    _warn(
      `[NoJS] "validate" has moved to @erickxavier/nojs-elements. ` +
      `Install the plugin and call NoJS.use(NoJSElements) to enable it.`
    );
  },
});
