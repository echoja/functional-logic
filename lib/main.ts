import { createLog, getAllProductsMock } from "./test9-log-typing";

getAllProductsMock({ log: createLog("test-key") }).then((result) => {
  console.log(`success get ${result.items.length} products`);
});
