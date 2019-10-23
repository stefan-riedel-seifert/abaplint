import {TypedIdentifier} from "../types/_typed_identifier";
import {StatementNode, ExpressionNode} from "../nodes";
import * as Statements from "../statements";
import * as Expressions from "../expressions";
import * as Types from "../types/basic/";
import {Scope} from "./_scope";
import {AbstractType} from "../types/basic/_abstract_type";
import {TypedConstantIdentifier} from "../types/_typed_constant_identifier";
import {Chaining} from "./chaining";

export class BasicTypes {
  private readonly filename: string;
  private readonly scope: Scope;

  public constructor(filename: string, scope: Scope) {
    this.filename = filename;
    this.scope = scope;
  }

  public buildVariables(node: StatementNode): void {
    const sub = node.get();

// todo, refactor this method

// fallback to untyped
    let fallback: ExpressionNode | undefined;
    if (sub instanceof Statements.FieldSymbol) {
      fallback = node.findFirstExpression(Expressions.FieldSymbol);
    } else if (sub instanceof Statements.Tables
        || sub instanceof Statements.SelectOption) {
      fallback = node.findFirstExpression(Expressions.Field);
    }
    if (fallback === undefined) { return; }
    this.scope.addIdentifier(new TypedIdentifier(fallback.getFirstToken(), this.filename, new Types.UnknownType()));
  }

//////////////////////

  public resolveChainType(stat: StatementNode | ExpressionNode, expr: ExpressionNode | undefined): AbstractType | undefined {
// todo, move this to the expresssion, and perhaps rename/add another expression for types
    if (expr === undefined) {
      return undefined;
    }

    const chainText = expr.concatTokens().toUpperCase();
    if (chainText === "STRING") {
      return new Types.StringType();
    } else if (chainText === "I") {
      return new Types.IntegerType();
    } else if (chainText === "F") {
      return new Types.FloatType();
    } else if (chainText === "C") {
      return new Types.CharacterType(this.findLength(stat));
    }

    // todo, this only handles simple names
    const typ = this.scope.resolveType(chainText);
    if (typ) {
      return typ.getType();
    }

    return undefined;
  }

  public simpleType(node: StatementNode): TypedIdentifier | undefined {
    const nameExpr = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (nameExpr === undefined) {
      return undefined;
    }
    const name = nameExpr.getFirstToken();
    const chain = node.findFirstExpression(Expressions.FieldChain);

    const type = node.findFirstExpression(Expressions.Type);
    const text = type ? type.concatTokens().toUpperCase() : "TYPE";

    let found: AbstractType | undefined = undefined;
    if (text.startsWith("LIKE LINE OF")) {
      return undefined;
    } else if (text.startsWith("LIKE REF TO")) {
      return undefined;
    } else if (text.startsWith("LIKE")) {
      return undefined;
    } else if (text.startsWith("TYPE LINE OF")) {
      return undefined;
    } else if (text.startsWith("TYPE REF TO")) {
      return undefined;
    } else if (text.startsWith("TYPE")) {
      found = this.resolveChainType(node, chain);
      if (found === undefined && chain === undefined) {
        found = new Types.CharacterType(1);
      }
    }

    if (found) {
      if (node.get() instanceof Statements.Constant) { // todo, move this to Statements.Constant
        return new TypedConstantIdentifier(name, this.filename, found, this.findValue(node, name.getStr()));
      } else {
        return new TypedIdentifier(name, this.filename, found);
      }
    }

    return undefined;
  }

  private findValue(node: StatementNode, name: string): string {
    const val = node.findFirstExpression(Expressions.Value);
    if (val === undefined) {
      throw new Error("set VALUE, " + name);
    }

    if (val.concatTokens().toUpperCase() === "VALUE IS INITIAL") {
      return "";
    }

    const constant = val.findFirstExpression(Expressions.Constant);
    if (constant) {
      return constant.concatTokens();
    }

    const chain = val.findFirstExpression(Expressions.SimpleFieldChain);
    if (chain) {
      return new Chaining(this.scope).resolveConstantValue(chain);
    }

    throw new Error("findValue, unexpected, " + name);
  }

  private findLength(node: StatementNode | ExpressionNode): number {
    const flen = node.findFirstExpression(Expressions.ConstantFieldLength);
    if (flen) {
      const cintExpr = flen.findFirstExpression(Expressions.Integer);
      if (cintExpr) {
        return this.parseInt(cintExpr.concatTokens());
      }

      const cchain = flen.findFirstExpression(Expressions.SimpleFieldChain);
      if (cchain) {
        return this.parseInt(new Chaining(this.scope).resolveConstantValue(cchain));
      }
    }

    const val = node.findFirstExpression(Expressions.Length);
    if (val === undefined) {
      return 1;
    }

    const intExpr = val.findFirstExpression(Expressions.Integer);
    if (intExpr) {
      return this.parseInt(intExpr.concatTokens());
    }

    const strExpr = val.findFirstExpression(Expressions.ConstantString);
    if (strExpr) {
      return this.parseInt(strExpr.concatTokens());
    }

    const chain = val.findFirstExpression(Expressions.SimpleFieldChain);
    if (chain) {
      return this.parseInt(new Chaining(this.scope).resolveConstantValue(chain));
    }

    throw new Error("Unexpected, findLength");
  }

  private parseInt(text: string): number {
    if (text.startsWith("'")) {
      text = text.split("'")[1];
    } else if (text.startsWith("`")) {
      text = text.split("`")[1];
    }

    return parseInt(text, 10);
  }

}