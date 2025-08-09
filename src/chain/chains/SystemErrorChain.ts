import { TimestampParser } from "../handlers/TimestampParser";
import { LevelValidator } from "../handlers/LevelValidator";
import { MessageTrimmer } from "../handlers/MessageTrimmer";
import { AbstractHandler } from "../AbstractHandler";

export function buildSystemErrorChain(): AbstractHandler {
  const ts = new TimestampParser();
  const lev = new LevelValidator();
  const msg = new MessageTrimmer();
  ts.setNext(lev).setNext(msg);
  return ts;
}
