import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "GET BADI lo_foobar.",
  "GET BADI lo_foobar FILTERS foo = bar.",
  "GET BADI l_badi CONTEXT me.",
];

statementType(tests, "GET BADI", Statements.GetBadi);