import { TimestampParser } from "../handlers/TimestampParser";
import { AmountParser } from "../handlers/AmountParser";
import { CurrencyNormalizer } from "../handlers/CurrencyNormalizer";
import { AbstractHandler } from "../AbstractHandler";

export function buildTransactionChain(): AbstractHandler {
  const ts = new TimestampParser();
  const amt = new AmountParser();
  const cur = new CurrencyNormalizer();
  ts.setNext(amt).setNext(cur);
  return ts;
}
