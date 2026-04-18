// Safe expression evaluator — NO eval() or Function()
// Supports: property access, comparisons, arithmetic, logical ops, whitelisted functions

type Scope = Record<string, unknown>;

export function evaluateExpression(expr: string, scope: Scope): unknown {
  const tokens = tokenize(expr.trim());
  const parser = new Parser(tokens, scope);
  return parser.parseExpression();
}

export function evaluateBoolean(expr: string, scope: Scope): boolean {
  const result = evaluateExpression(expr, scope);
  return Boolean(result);
}

export function resolveTemplateString(template: string, scope: Scope): string {
  return template.replace(/\{\{(.+?)\}\}/g, (_, expr) => {
    const result = evaluateExpression(expr.trim(), scope);
    return result == null ? '' : String(result);
  });
}

// ---- Tokenizer ----

type TokenType =
  | 'number' | 'string' | 'boolean' | 'null' | 'identifier'
  | 'dot' | 'lparen' | 'rparen' | 'lbracket' | 'rbracket'
  | 'comma' | 'questionmark' | 'colon'
  | 'plus' | 'minus' | 'star' | 'slash' | 'percent'
  | 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte'
  | 'and' | 'or' | 'not'
  | 'eof';

interface Token {
  type: TokenType;
  value: unknown;
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (/\s/.test(ch)) { i++; continue; }

    if (ch === '.' && (i + 1 >= input.length || !/\d/.test(input[i + 1]))) {
      tokens.push({ type: 'dot', value: '.' }); i++; continue;
    }
    if (ch === '(') { tokens.push({ type: 'lparen', value: '(' }); i++; continue; }
    if (ch === ')') { tokens.push({ type: 'rparen', value: ')' }); i++; continue; }
    if (ch === '[') { tokens.push({ type: 'lbracket', value: '[' }); i++; continue; }
    if (ch === ']') { tokens.push({ type: 'rbracket', value: ']' }); i++; continue; }
    if (ch === ',') { tokens.push({ type: 'comma', value: ',' }); i++; continue; }
    if (ch === '?') { tokens.push({ type: 'questionmark', value: '?' }); i++; continue; }
    if (ch === ':') { tokens.push({ type: 'colon', value: ':' }); i++; continue; }
    if (ch === '+') { tokens.push({ type: 'plus', value: '+' }); i++; continue; }
    if (ch === '-') { tokens.push({ type: 'minus', value: '-' }); i++; continue; }
    if (ch === '*') { tokens.push({ type: 'star', value: '*' }); i++; continue; }
    if (ch === '/') { tokens.push({ type: 'slash', value: '/' }); i++; continue; }
    if (ch === '%') { tokens.push({ type: 'percent', value: '%' }); i++; continue; }

    if (ch === '=' && input[i + 1] === '=') { tokens.push({ type: 'eq', value: '==' }); i += 2; continue; }
    if (ch === '!' && input[i + 1] === '=') { tokens.push({ type: 'neq', value: '!=' }); i += 2; continue; }
    if (ch === '!') { tokens.push({ type: 'not', value: '!' }); i++; continue; }
    if (ch === '<' && input[i + 1] === '=') { tokens.push({ type: 'lte', value: '<=' }); i += 2; continue; }
    if (ch === '<') { tokens.push({ type: 'lt', value: '<' }); i++; continue; }
    if (ch === '>' && input[i + 1] === '=') { tokens.push({ type: 'gte', value: '>=' }); i += 2; continue; }
    if (ch === '>') { tokens.push({ type: 'gt', value: '>' }); i++; continue; }
    if (ch === '&' && input[i + 1] === '&') { tokens.push({ type: 'and', value: '&&' }); i += 2; continue; }
    if (ch === '|' && input[i + 1] === '|') { tokens.push({ type: 'or', value: '||' }); i += 2; continue; }

    // Numbers
    if (/\d/.test(ch) || (ch === '.' && i + 1 < input.length && /\d/.test(input[i + 1]))) {
      let num = '';
      while (i < input.length && (/\d/.test(input[i]) || input[i] === '.')) {
        num += input[i]; i++;
      }
      tokens.push({ type: 'number', value: parseFloat(num) }); continue;
    }

    // Strings
    if (ch === '"' || ch === "'") {
      const quote = ch; i++;
      let str = '';
      while (i < input.length && input[i] !== quote) {
        if (input[i] === '\\') { i++; str += input[i] ?? ''; }
        else { str += input[i]; }
        i++;
      }
      i++; // closing quote
      tokens.push({ type: 'string', value: str }); continue;
    }

    // Identifiers / keywords
    if (/[a-zA-Z_$]/.test(ch)) {
      let ident = '';
      while (i < input.length && /[a-zA-Z0-9_$]/.test(input[i])) {
        ident += input[i]; i++;
      }
      if (ident === 'true') tokens.push({ type: 'boolean', value: true });
      else if (ident === 'false') tokens.push({ type: 'boolean', value: false });
      else if (ident === 'null') tokens.push({ type: 'null', value: null });
      else tokens.push({ type: 'identifier', value: ident });
      continue;
    }

    i++; // skip unknown
  }

  tokens.push({ type: 'eof', value: null });
  return tokens;
}

// ---- Parser (recursive descent) ----

const BUILTIN_FUNCTIONS: Record<string, (...args: unknown[]) => unknown> = {
  len: (arr: unknown) => Array.isArray(arr) ? arr.length : typeof arr === 'string' ? arr.length : 0,
  upper: (s: unknown) => typeof s === 'string' ? s.toUpperCase() : s,
  lower: (s: unknown) => typeof s === 'string' ? s.toLowerCase() : s,
  trim: (s: unknown) => typeof s === 'string' ? s.trim() : s,
  abs: (n: unknown) => typeof n === 'number' ? Math.abs(n) : 0,
  round: (n: unknown) => typeof n === 'number' ? Math.round(n) : 0,
  floor: (n: unknown) => typeof n === 'number' ? Math.floor(n) : 0,
  ceil: (n: unknown) => typeof n === 'number' ? Math.ceil(n) : 0,
  str: (v: unknown) => String(v ?? ''),
  num: (v: unknown) => Number(v) || 0,
  bool: (v: unknown) => Boolean(v),
};

class Parser {
  private pos = 0;

  constructor(private tokens: Token[], private scope: Scope) {}

  parseExpression(): unknown {
    return this.parseTernary();
  }

  private peek(): Token {
    return this.tokens[this.pos] ?? { type: 'eof', value: null };
  }

  private advance(): Token {
    const t = this.tokens[this.pos];
    this.pos++;
    return t ?? { type: 'eof', value: null };
  }

  private expect(type: TokenType): Token {
    const t = this.advance();
    if (t.type !== type) throw new Error(`Expected ${type}, got ${t.type}`);
    return t;
  }

  private parseTernary(): unknown {
    const cond = this.parseOr();
    if (this.peek().type === 'questionmark') {
      this.advance();
      const then = this.parseExpression();
      this.expect('colon');
      const els = this.parseExpression();
      return cond ? then : els;
    }
    return cond;
  }

  private parseOr(): unknown {
    let left = this.parseAnd();
    while (this.peek().type === 'or') {
      this.advance();
      const right = this.parseAnd();
      left = Boolean(left) || Boolean(right);
    }
    return left;
  }

  private parseAnd(): unknown {
    let left = this.parseComparison();
    while (this.peek().type === 'and') {
      this.advance();
      const right = this.parseComparison();
      left = Boolean(left) && Boolean(right);
    }
    return left;
  }

  private parseComparison(): unknown {
    let left = this.parseAddition();
    const op = this.peek().type;
    if (['eq', 'neq', 'lt', 'lte', 'gt', 'gte'].includes(op)) {
      this.advance();
      const right = this.parseAddition();
      switch (op) {
        case 'eq': return left == right;
        case 'neq': return left != right;
        case 'lt': return (left as number) < (right as number);
        case 'lte': return (left as number) <= (right as number);
        case 'gt': return (left as number) > (right as number);
        case 'gte': return (left as number) >= (right as number);
      }
    }
    return left;
  }

  private parseAddition(): unknown {
    let left = this.parseMultiplication();
    while (this.peek().type === 'plus' || this.peek().type === 'minus') {
      const op = this.advance().type;
      const right = this.parseMultiplication();
      if (op === 'plus') {
        if (typeof left === 'string' || typeof right === 'string') {
          left = String(left ?? '') + String(right ?? '');
        } else {
          left = (left as number) + (right as number);
        }
      } else {
        left = (left as number) - (right as number);
      }
    }
    return left;
  }

  private parseMultiplication(): unknown {
    let left = this.parseUnary();
    while (['star', 'slash', 'percent'].includes(this.peek().type)) {
      const op = this.advance().type;
      const right = this.parseUnary();
      if (op === 'star') left = (left as number) * (right as number);
      else if (op === 'slash') left = (right as number) !== 0 ? (left as number) / (right as number) : 0;
      else left = (left as number) % (right as number);
    }
    return left;
  }

  private parseUnary(): unknown {
    if (this.peek().type === 'not') {
      this.advance();
      return !this.parseUnary();
    }
    if (this.peek().type === 'minus') {
      this.advance();
      return -(this.parseUnary() as number);
    }
    return this.parseAccess();
  }

  private parseAccess(): unknown {
    let value = this.parsePrimary();
    while (true) {
      if (this.peek().type === 'dot') {
        this.advance();
        const prop = this.expect('identifier').value as string;
        if (value != null && typeof value === 'object') {
          value = (value as Record<string, unknown>)[prop];
        } else {
          value = undefined;
        }
      } else if (this.peek().type === 'lbracket') {
        this.advance();
        const index = this.parseExpression();
        this.expect('rbracket');
        if (Array.isArray(value) && typeof index === 'number') {
          value = value[index];
        } else if (value != null && typeof value === 'object' && typeof index === 'string') {
          value = (value as Record<string, unknown>)[index];
        } else {
          value = undefined;
        }
      } else {
        break;
      }
    }
    return value;
  }

  private parsePrimary(): unknown {
    const token = this.peek();

    switch (token.type) {
      case 'number':
      case 'string':
      case 'boolean':
      case 'null':
        this.advance();
        return token.value;

      case 'identifier': {
        const name = token.value as string;
        this.advance();

        // Function call
        if (this.peek().type === 'lparen') {
          this.advance();
          const args: unknown[] = [];
          while (this.peek().type !== 'rparen' && this.peek().type !== 'eof') {
            args.push(this.parseExpression());
            if (this.peek().type === 'comma') this.advance();
          }
          this.expect('rparen');

          const fn = BUILTIN_FUNCTIONS[name];
          if (fn) return fn(...args);
          throw new Error(`Unknown function: ${name}`);
        }

        // Variable lookup
        if (name in this.scope) return this.scope[name];
        return undefined;
      }

      case 'lparen': {
        this.advance();
        const val = this.parseExpression();
        this.expect('rparen');
        return val;
      }

      default:
        this.advance();
        return undefined;
    }
  }
}
