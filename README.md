## This is a Typescript application template

Well, I've banged my head around cjs, ejs, fmljs, and other file extensions enough to know that setting a basic template for a project is sometimes the most excruciating, root-canal-like predicament in putting together a project. This is especially the case when I'm just trying to use Typescript to create a little local CLI script for myself.

So, I've create this template mostly for myself, a little love note to my own quest toward automated self-oblivion. The goal here is to be able to build a very malleable typescript application without petting too many roadside yaks.

### Features

- Code formatting with [Prettier](https://prettier.io/)
- Linting with [ESLint](https://typescript-eslint.io/)
- Unit testing with [Jest](https://jestjs.io/)
- Bundling with [ESBuild](https://esbuild.github.io/)
- Changelog mangement with [auto-changelog](https://github.com/cookpete/auto-changelog)
- Pre- and post-commit sanity checks with [Husky](https://typicode.github.io/husky/)
- Dependency visualization with [Madge](https://www.npmjs.com/package/madge)
- Autogeneration of documentation with [TypeDoc](https://typedoc.org/)

## Setup

1. Create a copy of the template

```bash
gh repo create happy-bog --template git@github.com:evannagle/typescript-boot.git  --private --clone
```

2. Install the node libidinals

```bash
cd happy-bog

npm install
```

3. Rename the app.

```bash
make rename
```

3. Run the app

```bash
make app
```

Which should output:

```bash
🤖 Cleaning up ephemeral paths: dist coverage docs/graph.png
rm -rf dist coverage docs/graph.png

🤖 Building the app: dist/app.js
node scripts/esbuild.config.js production

🤖 Running the app: dist/app.js
> 42
```

4. Quickly globalize the script by adding it to your path:

```bash
make globalize

happy-bog

42
```

## Make Commands

You can read a description of all of the available `make` commands by running, well, `make`:

### app

Rebuild the app, then run it to get the output. This is a quick way to see the output of the app, and to sanity check the build.

```bash
$(call title, "Running the app: $(BIN_FOR_APP)")
@$(BIN_FOR_NODE) $(BIN_FOR_APP) | sed 's/^/> /'
```

### build

Build the app, dump into the dist folder.

```bash
$(call title, "Building the app: $(BIN_FOR_APP)")
$(BIN_FOR_NODE) $(PATH_FOR_ESBUILD_CONFIG) production
```

### changelog

Generate the changelog for the project.

```bash
$(call title, "Generating changelog")
$(BIN_FOR_NPX) auto-changelog -p -o CHANGELOG.md --hide-credit --release-summary --hide-empty-releases --sort-commits date-desc && git add CHANGELOG.md
```

### clean

Clean up ephemeral paths.

```bash
$(call title, "Cleaning up ephemeral paths: $(PATHS_THAT_ARE_EPHEMERAL)")
rm -rf $(PATHS_THAT_ARE_EPHEMERAL)
```

### deep-clean

Clean up all the generated files. Also clean up node_modules and package-lock.json.

```bash
$(call title, "Cleaning up all generated files")
$(PATH_TO_SCRIPTS)/deep-clean.sh
```

### docs

Generate the documentation for the project.

```bash
$(call title, "Generating documentation")
$(BIN_FOR_NPX) typedoc --plugin typedoc-plugin-markdown --out $(PATH_TO_DOCS) src/index.ts
```

### env

Move `.env-example` to `.env`.

```bash
$(call title, "Moving .env-example to .env")
cp .env-example .env
```

### format

Format the code using prettier.

```bash
$(call title, "Formatting code")
$(BIN_FOR_NPX) prettier --write src/**/*.ts
```

### globalize

Globalize the project.

```bash
$(call title, "Globalizing the project")
$(BIN_FOR_NODE) $(PATH_TO_SCRIPTS)/globalize.js
```

### huh

Get the name of the command. Print the command, followed by the comments below it, like this one!

```bash
@$(BIN_FOR_NODE) $(PATH_TO_SCRIPTS)/makefile-parser.js --format=list
```

### install-husky

Install husky if it's not already installed.

```bash
$(call title, "Installing husky if needed")
@$(BIN_FOR_NPM) install --save-dev husky
$(BIN_FOR_NPX) husky init
```

### install-madge

Install madge if it's not already installed.

```bash
$(call title, "Installing madge if needed")
@$(BIN_FOR_NPM) list -g madge || $(BIN_FOR_NPM) install --location=global madge
```

### lint

Lint the code using eslint.

```bash
$(call title, "Linting code")
$(BIN_FOR_NPX) eslint src/**/*.ts
```

### lint-fix

Lint the code using eslint, and fix the issues.

```bash
$(call title, "Linting code and fixing issues")
$(BIN_FOR_NPX) eslint src/**/*.ts --fix
```

### pre-commit

Run the pre-commit checks.

```bash
$(call title, "Running pre-commit checks")
```

### rename

Rename the project.

```bash
$(call title, "Renaming the project")
$(BIN_FOR_NODE) $(PATH_TO_SCRIPTS)/rename-project.js
```

### test

Run the jest unit tests.

```bash
$(call title, "Running tests")
$(BIN_FOR_NPM) exec jest
```

### test-coverage

Run the jest unit tests with coverage enabled. Then open the coverage report in the browser.

```bash
$(call title, "Running tests with coverage")
$(BIN_FOR_NPM) exec jest tests --coverage
open coverage/index.html
```

### visualize-circular-dependencies

Visualize the circular dependencies in the project.

```bash
$(call title, "Visualizing circular dependencies")
@$(BIN_FOR_MADGE) --circular --extensions ts src
```

### visualize-dependencies

Visualize the dependencies in the project.

```bash
$(call title, "Visualizing dependencies")
@$(BIN_FOR_MADGE) --extensions ts src
```

### visualize-dependencies-graph

Visualize the dependencies in the project as a graph.

```bash
$(call title, "Visualizing dependencies as a graph")
mkdir -p $$(dirname $(PATH_FOR_GRAPH_PNG))
@$(BIN_FOR_MADGE) --extensions ts src --image $(PATH_FOR_GRAPH_PNG)
open $(PATH_FOR_GRAPH_PNG)
```
