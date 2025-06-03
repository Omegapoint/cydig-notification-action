import { MainService } from "./lib/MainService";
import * as core from "@actions/core";

export async function run(): Promise<void> {
  try {
    await new MainService().run();
    // Success is implicit if no error is thrown
  } catch (error: any) {
    console.error(error.message);
    core.setFailed("Failed to run task");
  }
}

run();
