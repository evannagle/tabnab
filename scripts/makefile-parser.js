import fs from 'fs';
import path from 'path';
import yargs from 'yargs';

class Command {
    constructor(name, description, commandLines, dependencies) {
        this.name = name;
        this.description = description;
        this.commandLines = commandLines;
        this.dependencies = dependencies;
    }
}

function parseCommands(lines) {
    const commands = [];
    while (lines.length > 0) {
        const nextCommand = parseCommand(lines);
        if (nextCommand) {
            commands.push(nextCommand);
        } else {
            lines.shift(); // remove other lines
        }
    }
    return commands;
}

function parseCommand(lines) {
    const nameLine = parseNameLine(lines);
    if (!nameLine) {
        return null;
    }

    const [name, dependenciesStr] = nameLine.split(":").map(part => part.trim());
    const dependencies = dependenciesStr ? dependenciesStr.split() : [];

    if (!name) {
        return null;
    }

    const description = Array.from(parseDescription(lines));
    if (description.length === 0) {
        return null;
    }

    const commands = Array.from(parseCommandLines(lines));

    return new Command(name, description, commands, dependencies);
}

function parseNameLine(lines) {
    if (lines.length === 0) {
        return null;
    }
    if (!/^[a-zA-Z0-9_-]+:/.test(lines[0])) {
        return null;
    } else {
        return lines.shift();
    }
}

function* parseDescription(lines) {
    while (lines.length > 0) {
        const nextLine = parseDescriptionLine(lines);
        if (nextLine) {
            yield nextLine;
        } else {
            break;
        }
    }
}

function parseDescriptionLine(lines) {
    if (lines.length === 0) {
        return null;
    }
    if (!lines[0].startsWith("# ")) {
        return null;
    }
    return lines.shift().substring(2).trim();
}

function* parseCommandLines(lines) {
    while (lines.length > 0) {
        const nextCommand = parseCommandLine(lines);
        if (nextCommand) {
            yield nextCommand;
        } else {
            break;
        }
    }
}

function parseCommandLine(lines) {
    if (lines.length === 0 || !lines[0].startsWith("\t")) {
        return null;
    } else {
        return lines.shift().trim();
    }
}

function printAsJson(commands) {
    console.log(JSON.stringify(commands, null, 4));
}

function printAsList(commands) {
    commands.forEach(command => {
        console.log(command.name);
        command.description.forEach(line => console.log(`  ${line}`));
        // command.commandLines.forEach(line => console.log(`\t${line}`));
        console.log();
    });
}

function printAsMarkdown(commands) {
    commands.forEach(command => {
        console.log(`### ${command.name}`);
        console.log();
        console.log(command.description.join(" ").trim());
        console.log()
        console.log("```bash");
        command.commandLines.forEach(line => console.log(`${line}`));
        console.log("```");
        console.log();
    });
}

const formats = {
    json: printAsJson,
    list: printAsList,
    markdown: printAsMarkdown
};

const args = yargs(process.argv.slice(2))
    .option('format', {
        alias: 'f',
        describe: 'Output format',
        choices: Object.keys(formats),
        default: 'json'
    })
    .help()
    .argv;

const makefilePath = path.join(process.cwd(), "Makefile");

if (!fs.existsSync(makefilePath)) {
    console.error("Makefile not found!");
    process.exit(1);
}

const lines = fs.readFileSync(makefilePath, 'utf-8').split('\n');
const commands = parseCommands(lines).sort((a, b) => a.name.localeCompare(b.name));
const formatFn = formats[args.format] || printAsJson;

formatFn(commands);