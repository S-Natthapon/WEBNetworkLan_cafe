import { printReceipt } from "./src/service/printerService";
import "dotenv/config";

async function test() {
    console.log("--- Starting Printer Test ---");
    const testItems = [
        { name: "Latte Hot", quantity: 1, price: 55 },
        { name: "Croissant", quantity: 2, price: 45 }
    ];

    console.log("Sending test items to printer...");
    const result = await printReceipt(testItems);
    
    if (result) {
        console.log("✅ SUCCESS: Printer command sent successfully.");
    } else {
        console.log("❌ FAILED: Check console logs for error details.");
    }
}

test();