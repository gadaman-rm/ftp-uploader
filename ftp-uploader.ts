#! /usr/bin/env node

import { Client } from "basic-ftp";
import { Command } from "commander";
import fs from "fs";
import path from "path";
import kleur from "kleur";

const program = new Command();

program
  .requiredOption("-h, --host <string>", "FTP host")
  .requiredOption("-u, --user <string>", "FTP username")
  .requiredOption("-p, --password <string>", "FTP password")
  .requiredOption("-f, --file <string>", "Local file path")
  .requiredOption(
    "-d, --directory <string>",
    "Destination directory on FTP server"
  )
  .option("-n, --newname <string>", "New file name on the FTP server");

program.parse(process.argv);

const options = program.opts();

async function uploadFile() {
  const client = new Client();

  try {
    console.log("Connecting to FTP server...");
    await client.access({
      host: options.host,
      user: options.user,
      password: options.password,
    });

    const localFilePath = path.resolve(options.file);
    if (!fs.existsSync(localFilePath)) {
      throw new Error(`File not found: ${localFilePath}`);
    }

    const newName = options.newname || path.basename(localFilePath);
    const directory = options.directory.replace(/\\/g, "/");
    const remotePath = path
      .join(options.directory, newName)
      .replace(/\\/g, "/");

    console.log("Ensure remote directorry exist: ", directory);
    await client.ensureDir(directory);
    console.log(kleur.blue(`Uploading ${options.file} to ${remotePath}...`));
    await client.uploadFrom(options.file, newName);

    console.log(kleur.green("✓ Upload successful!"));
  } catch (err) {
    console.error(kleur.red("✗ Upload failed!"), (err as Error).message);
  } finally {
    client.close();
  }
}

uploadFile();
