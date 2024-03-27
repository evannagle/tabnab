import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import prompts from 'prompts';


(async () => {
    try {
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        const packageJsonData = await fs.readFile(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(packageJsonData);
        const likelyCurrentName = packageJson.name;

        const { command_name } = await prompts({
            type: 'text',
            name: 'command_name',
            message: 'Command name',
            initial: likelyCurrentName
        });

        const { install_path } = await prompts({
            type: 'text',
            name: 'install_path',
            message: 'Install in what bin?',
            initial: '/usr/local/bin',
        });

        // ensure bin exists and is folder
        if (!(await fs.stat(install_path)).isDirectory()) {
            console.error("Error: Install path", install_path, "is not a directory. Exiting.");
            process.exit(1);
        }

        try {
            execSync('make build'); // Run the build step

            const commandPath = path.join(process.cwd(), 'dist/app.js');

            if (!(await fs.stat(commandPath)).isFile()) {
                console.error("Error: Command path", commandPath, "does not exist. Exiting.");
                process.exit(1);
            }

            // Make the file executable
            await fs.chmod(commandPath, 0o755);

            // Check if the file already exists at the install path
            const installFile = path.join(install_path, command_name);
            if (await fs.access(installFile).then(() => true).catch(() => false)) {
                const { shouldDelete } = await prompts({
                    type: 'confirm',
                    name: 'shouldDelete',
                    message: `${installFile} already exists. Replace it?`
                });

                if (shouldDelete) {
                    execSync(`sudo rm ${installFile}`); // Requires sudo privileges
                } else {
                    return;
                }
            }

            // Create symbolic link
            execSync(`sudo ln -s ${commandPath} ${installFile}`);

            // Update .env with link to command in bin
            const envPath = path.join(process.cwd(), '.env');

            // Make env file if it doesn't exist
            // By copying the example file
            execSync(`make env`)

            const envData = await fs.readFile(envPath, 'utf8');

            // replace or append
            if (envData.includes('COMMAND_PATH')) {
                const newEnvData = envData.replace(/COMMAND_PATH=.*/, `COMMAND_PATH=${installFile}`);
                await fs.writeFile(envPath, newEnvData);
            } else {
                const newEnvData = envData + `\nCOMMAND_PATH=${installFile}`;
                await fs.writeFile(envPath, newEnvData);
            }
        } catch (error) {
            console.error("Installation error:", error);
        }

    } catch (error) {
        console.error("Error getting current project name:", error);
        process.exit(1);
    }
})();
