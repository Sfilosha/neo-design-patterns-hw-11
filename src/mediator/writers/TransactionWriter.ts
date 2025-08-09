import { TransactionRecord } from "../../models/DataRecord";
import * as fs from "fs/promises";
import * as path from "path";

export class TransactionWriter {
  private lines: string[] = ["timestamp,amount,currency"];
  write(record: TransactionRecord) {
    const line = `${record.timestamp},${record.amount},${record.currency.toUpperCase()}`;
    this.lines.push(line);
  }
  async finalize() {
    const outputPath = path.join("output", "transactions.csv");
    await fs.writeFile(outputPath, this.lines.join("\n"), "utf-8");
  }
}
