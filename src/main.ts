import * as fs from "fs/promises";
import * as path from "path";
import { buildAccessLogChain } from "./chain/chains/AccessLogChain";
import { buildTransactionChain } from "./chain/chains/TransactionChain";
import { buildSystemErrorChain } from "./chain/chains/SystemErrorChain";
import { ProcessingMediator } from "./mediator/ProcessingMediator";
import { AccessLogWriter } from "./mediator/writers/AccessLogWriter";
import { TransactionWriter } from "./mediator/writers/TransactionWriter";
import { ErrorLogWriter } from "./mediator/writers/ErrorLogWriter";
import { RejectedWriter } from "./mediator/writers/RejectedWriter";
import { DataRecord } from "./models/DataRecord";

const handlerMap = {
  access_log: buildAccessLogChain,
  transaction: buildTransactionChain,
  system_error: buildSystemErrorChain,
};

async function main() {
  // 1. Читаємо вхідні записи
  const dataPath = path.join("src", "data", "records.json");
  const rawData = await fs.readFile(dataPath, "utf-8");
  const records: DataRecord[] = JSON.parse(rawData);

  // 2. Створюємо екземпляри
  const accessLogWriter = new AccessLogWriter();
  const transactionWriter = new TransactionWriter();
  const errorLogWriter = new ErrorLogWriter();
  const rejectedWriter = new RejectedWriter();

  const mediator = new ProcessingMediator(
    accessLogWriter,
    transactionWriter,
    errorLogWriter,
    rejectedWriter
  );

  let processedCount = 0;
  let rejectedCount = 0;

  // 3. Обробляємо кожен запис
  for (const record of records) {
    const builder = handlerMap[record.type];
    if (!builder) {
      mediator.onRejected(record, `Unknown record type: ${record.type}`);
      rejectedCount++;
      continue;
    }

    const handlerChain = builder();

    try {
      const processed = handlerChain.handle(record);
      mediator.onSuccess(processed);
      processedCount++;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      mediator.onRejected(record, errorMessage);
      rejectedCount++;
    }
  }

  // 4. Записуємо результати
  await mediator.finalize();

  // 5. Виводимо у консоль
  console.log(`[INFO] Завантажено записів: ${records.length}`);
  console.log(`[INFO] Успішно оброблено: ${processedCount}`);
  console.log(`[WARN] Відхилено з помилками: ${rejectedCount}`);
  console.log(`[INFO] Звіт збережено у директорії output/`);
}

main().catch((e) => {
  console.error("Помилка при запуску:", e);
  process.exit(1);
});
