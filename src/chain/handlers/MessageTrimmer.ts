import { AbstractHandler } from "../AbstractHandler";
import { SystemErrorRecord } from "../../models/DataRecord";

export class MessageTrimmer extends AbstractHandler {
  protected process(record: SystemErrorRecord): SystemErrorRecord {
    if (record.message.length > 255) {
      return {
        ...record,
        message: record.message.slice(0, 255),
      };
    }
    return record;
  }
}
