Prototype of a CLI to spin up ephemeral prometheus instances.

```sh
# Create a new prometheus instance
node autometrics-cli.js create [name]

# Destroy an instance
node autometrics-cli.js destroy [name]

# Get status of instance
node autometrics-cli.js status [name]

# Print help
node autometrics-cli.js help
```

Create an alias for this command:

```sh
alias autometrics="node /path/to/autometrics-cli.js"
```
