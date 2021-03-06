import {IStatement} from "./_statement";
import {verNot, seq} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class DeleteDynpro implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("DELETE DYNPRO", Source);

    return verNot(Version.Cloud, ret);
  }

}