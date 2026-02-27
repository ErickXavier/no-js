// ═══════════════════════════════════════════════════════════════════════
//  EXPRESSION EVALUATOR
// ═══════════════════════════════════════════════════════════════════════

import { _stores, _routerInstance, _filters, _warn, _config } from "./globals.js";
import { _i18n } from "./i18n.js";
import { _collectKeys } from "./context.js";

const _exprCache = new Map();

// CSP-safe expression evaluator (no new Function / eval)
// Handles dot-notation paths, basic comparisons, boolean operators, negation, and literals.
function _cspSafeEval(expr, keys, vals) {
  const scope = {};
  for (let i = 0; i < keys.length; i++) scope[keys[i]] = vals[i];

  function resolvePath(path, obj) {
    return path.split(".").reduce((o, k) => o?.[k], obj);
  }

  function parseValue(token) {
    const t = token.trim();
    if (t === "true") return true;
    if (t === "false") return false;
    if (t === "null") return null;
    if (t === "undefined") return undefined;
    if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
    if (/^(['"`]).*\1$/.test(t)) return t.slice(1, -1);
    // Treat as property path resolved from scope
    return resolvePath(t, scope);
  }

  const trimmed = expr.trim();

  // Handle ternary: condition ? trueExpr : falseExpr
  const ternaryMatch = trimmed.match(/^(.+?)\s*\?\s*(.+?)\s*:\s*(.+)$/);
  if (ternaryMatch) {
    const cond = _cspSafeEval(ternaryMatch[1].trim(), keys, vals);
    return cond
      ? _cspSafeEval(ternaryMatch[2].trim(), keys, vals)
      : _cspSafeEval(ternaryMatch[3].trim(), keys, vals);
  }

  // Handle logical OR (||)
  if (trimmed.includes("||")) {
    const parts = trimmed.split("||");
    for (const part of parts) {
      const val = _cspSafeEval(part.trim(), keys, vals);
      if (val) return val;
    }
    return _cspSafeEval(parts[parts.length - 1].trim(), keys, vals);
  }

  // Handle logical AND (&&)
  if (trimmed.includes("&&")) {
    const parts = trimmed.split("&&");
    let last;
    for (const part of parts) {
      last = _cspSafeEval(part.trim(), keys, vals);
      if (!last) return last;
    }
    return last;
  }

  // Handle comparisons: ===, !==, ==, !=, >=, <=, >, <
  const cmpMatch = trimmed.match(/^(.+?)\s*(===|!==|==|!=|>=|<=|>|<)\s*(.+)$/);
  if (cmpMatch) {
    const left = parseValue(cmpMatch[1]);
    const right = parseValue(cmpMatch[3]);
    switch (cmpMatch[2]) {
      case "===": return left === right;
      case "!==": return left !== right;
      case "==":  return left == right;
      case "!=":  return left != right;
      case ">=":  return left >= right;
      case "<=":  return left <= right;
      case ">":   return left > right;
      case "<":   return left < right;
    }
  }

  // Handle negation
  if (trimmed.startsWith("!")) {
    return !_cspSafeEval(trimmed.slice(1).trim(), keys, vals);
  }

  return parseValue(trimmed);
}

// Parse pipe syntax: "expr | filter1 | filter2:arg"
function _parsePipes(exprStr) {
  // Don't split on || (logical OR)
  const parts = [];
  let current = "";
  let depth = 0;
  let inStr = false;
  let strChar = "";
  for (let i = 0; i < exprStr.length; i++) {
    const ch = exprStr[i];
    if (inStr) {
      current += ch;
      if (ch === strChar && exprStr[i - 1] !== "\\") inStr = false;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      inStr = true;
      strChar = ch;
      current += ch;
      continue;
    }
    if (ch === "(" || ch === "[" || ch === "{") {
      depth++;
      current += ch;
      continue;
    }
    if (ch === ")" || ch === "]" || ch === "}") {
      depth--;
      current += ch;
      continue;
    }
    if (
      ch === "|" &&
      depth === 0 &&
      exprStr[i + 1] !== "|" &&
      exprStr[i - 1] !== "|"
    ) {
      parts.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  parts.push(current.trim());
  return parts;
}

function _applyFilter(value, filterStr) {
  const colonIdx = filterStr.indexOf(":");
  let name, argStr;
  if (colonIdx === -1) {
    name = filterStr.trim();
    argStr = null;
  } else {
    name = filterStr.substring(0, colonIdx).trim();
    argStr = filterStr.substring(colonIdx + 1).trim();
  }
  const fn = _filters[name];
  if (!fn) {
    _warn(`Unknown filter: ${name}`);
    return value;
  }
  // Parse args: split by comma but respect quotes
  const args = argStr ? _parseFilterArgs(argStr) : [];
  return fn(value, ...args);
}

function _parseFilterArgs(str) {
  const args = [];
  let current = "";
  let inStr = false;
  let strChar = "";
  for (const ch of str) {
    if (inStr) {
      if (ch === strChar) {
        inStr = false;
        continue;
      }
      current += ch;
      continue;
    }
    if (ch === "'" || ch === '"') {
      inStr = true;
      strChar = ch;
      continue;
    }
    if (ch === ",") {
      args.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) args.push(current.trim());
  // Try to parse numbers
  return args.map((a) => {
    const n = Number(a);
    return isNaN(n) ? a : n;
  });
}

export function evaluate(expr, ctx) {
  if (expr == null || expr === "") return undefined;
  try {
    const pipes = _parsePipes(expr);
    const mainExpr = pipes[0];
    const { keys, vals } = _collectKeys(ctx);

    // Add special variables
    const specialKeys = [
      "$store",
      "$route",
      "$router",
      "$i18n",
      "$refs",
      "$form",
    ];
    for (const sk of specialKeys) {
      if (!keys.includes(sk)) {
        keys.push(sk);
        vals[sk] = ctx[sk];
      }
    }

    const keyArr = keys;
    const valArr = keyArr.map((k) => vals[k]);

    let result;
    if (_config.csp === "strict") {
      result = _cspSafeEval(mainExpr, keyArr, valArr);
    } else {
      let cacheKey = mainExpr + "|" + keyArr.join(",");
      let fn = _exprCache.get(cacheKey);
      if (!fn) {
        fn = new Function(...keyArr, `return (${mainExpr})`);
        _exprCache.set(cacheKey, fn);
      }
      result = fn(...valArr);
    }

    // Apply filters
    for (let i = 1; i < pipes.length; i++) {
      result = _applyFilter(result, pipes[i]);
    }

    return result;
  } catch (e) {
    return undefined;
  }
}

// Execute a statement (for on:* handlers)
export function _execStatement(expr, ctx, extraVars = {}) {
  try {
    const { keys, vals } = _collectKeys(ctx);
    // Add special vars
    const specials = {
      $store: _stores,
      $route: _routerInstance?.current,
      $router: _routerInstance,
      $i18n: _i18n,
      $refs: ctx.$refs,
    };
    Object.assign(specials, extraVars);
    for (const [k, v] of Object.entries(specials)) {
      if (!keys.includes(k)) {
        keys.push(k);
        vals[k] = v;
      }
    }

    const keyArr = [...keys];
    const valArr = keyArr.map((k) => vals[k]);

    // Build setters to write back state through the full context chain.
    // For each key in any ancestor context, find the owning context at runtime
    // and call $set on it — so mutations inside `each` loops correctly
    // propagate back to parent state (e.g. cart updated from a loop's on:click).
    const chainKeys = new Set();
    let _wCtx = ctx;
    while (_wCtx && _wCtx.__isProxy) {
      for (const k of Object.keys(_wCtx.__raw)) chainKeys.add(k);
      _wCtx = _wCtx.$parent;
    }
    const setters = [...chainKeys]
      .map(
        (k) =>
          `{let _c=__ctx;while(_c&&_c.__isProxy){if('${k}'in _c.__raw){_c.$set('${k}',typeof ${k}!=='undefined'?${k}:_c.__raw['${k}']);break;}_c=_c.$parent;}}`,
      )
      .join("\n");

    const fn = new Function("__ctx", ...keyArr, `${expr};\n${setters}`);
    fn(ctx, ...valArr);
  } catch (e) {
    _warn("Expression error:", expr, e.message);
  }
}

export function resolve(path, ctx) {
  return path.split(".").reduce((o, k) => o?.[k], ctx);
}

// Interpolate strings like "/users/{user.id}?q={search}"
export function _interpolate(str, ctx) {
  return str.replace(/\{([^}]+)\}/g, (_, expr) => {
    const val = evaluate(expr.trim(), ctx);
    return val != null ? val : "";
  });
}
